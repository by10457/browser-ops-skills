import {pauseBeforeOperation} from '../pacing.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { withBrowser, listTabs, selectTab } from "./../browser.mjs";
import { bindingFor, withLock } from '../runner.mjs';
import { hash, validateActionTask, verifyPlan, fail } from './schema.mjs';
import { HuyouAdapter } from './adapter.mjs';
import { buildActionPlan, executePlan, reconcilePlan } from './engine.mjs';
import { Journal } from './journal.mjs';

export async function runAction({workspace,command,task,plan,bindingName,postId,targetId}) {await pauseBeforeOperation();
  if(command==='prepare') task=validateActionTask(task);
  else if(command!=='comments') {verifyPlan(plan,command==='reconcile'?0:Date.now());task=plan.task;}
  const name=task?.binding||bindingName;
  const binding=await bindingFor(workspace,name);
  if(plan&&hash(binding)!==hash(plan.binding))fail('BINDING_CHANGED','绑定已修改，请重新生成操作计划');
  if(command==='comments'&&!/^\d+$/.test(postId||''))fail('INVALID_TARGET','需要数字字符串 postId');
  const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}`;
  const runDir=path.join(workspace,'runs',runId);await mkdir(runDir,{recursive:true});
  const save=(name,data)=>writeFile(path.join(runDir,name),JSON.stringify(data,null,2)+'\n','utf8');
  await save('request.json',{command,task,planDigest:plan?.digest,bindingName:name,postId});
  let cleanupWarning;
  try {
    const data=await withLock(workspace,binding.browserId,()=>withBrowser({id:binding.browserId},async browser=>{
      // A detail modal changes the query string. Context is checked independently below.
      const tab=selectTab(await listTabs(browser),{origin:'https://hy.sns.sohu.com',targetId});
      const originalURL=tab.page.url(),adapter=new HuyouAdapter(tab.page,binding);
      // Chromium may suspend animation frames in background tabs; clicks use them for scrolling.
      await tab.page.bringToFront();
      let result;
      try {
        if(command==='comments') result={status:'read',detail:await adapter.inspectComments(postId)};
        else if(command==='prepare') {
          result=await buildActionPlan(task,binding,adapter);await save('plan.json',result);
        } else if(command==='rehearse') {
          const current=await adapter.prepare(task,plan.evidence);
          await adapter.stage(task,current);await adapter.assertStaged(task,current);
          result={status:'rehearsed',submitted:false,planDigest:plan.digest};
        } else if(command==='execute') result=await executePlan(plan,adapter,new Journal(workspace));
        else if(command==='reconcile') result=await reconcilePlan(plan,adapter,new Journal(workspace));
        else fail('UNKNOWN_COMMAND','未知操作命令');
        return result;
      } finally {
        adapter.dispose();
        // Keep uncertain submissions visible for manual inspection; don't discard their drafts.
        if(!['uncertain','blocked-uncertain'].includes(result?.status)) {
          try{await adapter.cleanup(originalURL);}catch(e){cleanupWarning=e.code||'PAGE_NOT_RESTORED';}
        }
      }
    }));
    const result={...data,runId,runDir,...(cleanupWarning?{cleanupWarning}:{}),...(command==='prepare'?{planFile:path.join(runDir,'plan.json')}:{})};
    await save('result.json',result);return result;
  } catch(e) {
    if(!e.code && (e.name==='TimeoutError'||e.message?.includes('timed out'))) {e.code='UI_TIMEOUT';e.message='页面控件等待超时；请检查页面加载和目标标签页';}
    await save('result.json',{status:'blocked',code:e.code||'UNEXPECTED_ERROR',message:e.code?e.message:'运行失败',runId,cleanupWarning});throw e;
  }
}
