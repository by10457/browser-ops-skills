import {runAction} from '../lib/actions/runner.mjs';
import {workspacePath} from '../config.mjs';
import {fail} from '../lib/actions/schema.mjs';
export function prepareAction(action,{workspace,targetId,...task}){return runAction({workspace:workspacePath(workspace),command:'prepare',targetId,task:{...task,version:2,action}});}
export function performAction(action,{workspace,targetId,plan,mode='execute'}){
  if(plan?.task?.action!==action||!['execute','rehearse','reconcile'].includes(mode))fail('INVALID_ACTION','计划类型或执行模式不匹配');
  // prepare returns metadata alongside the sealed plan; strip only known result metadata.
  const {runId,runDir,planFile,cleanupWarning,...sealed}=plan;
  if(cleanupWarning)fail('PAGE_NOT_RESTORED','先处理计划准备时的页面恢复警告');
  return runAction({workspace:workspacePath(workspace),command:mode,targetId,plan:sealed});
}
