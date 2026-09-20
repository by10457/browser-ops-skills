import { BitAPI, withBrowser, listTabs } from './lib/session.mjs';
import { SkillError } from './lib/api.mjs';
import { main, parseArgs } from './lib/cli.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {assessWindows,getWindow,prepareManagement,executeManagement} from './management.mjs';
import {doctor,inspectOperation} from './diagnostics.mjs';
const json=async file=>JSON.parse((await readFile(file,'utf8')).replace(/^\uFEFF/,''));
await main(async () => {
  const [command = 'help', ...args] = process.argv.slice(2);
  if(command==='doctor'){const o=parseArgs(args,['id']);return doctor({id:o.id});}
  if(command==='inspect-operation'){const o=parseArgs(args,['plan','workspace']);if(!o.plan||!o.workspace)throw new SkillError('FILE_REQUIRED','需要 --plan 和 --workspace');return inspectOperation(await json(o.plan),{workspace:o.workspace});}
  if(command==='assess'){const o=parseArgs(args,['count']);return assessWindows({count:Number(o.count)});}
  if(command==='detail'){const o=parseArgs(args,['id']);return getWindow({id:o.id});}
  if(command==='manage-prepare'){
    const o=parseArgs(args,['request','out']);if(!o.request||!o.out)throw new SkillError('FILE_REQUIRED','需要 --request 和 --out');
    const plan=await prepareManagement(await json(o.request));await writeFile(o.out,JSON.stringify(plan,null,2),{encoding:'utf8',flag:'wx'});return {status:'awaiting-user-approval',planFile:o.out,plan};
  }
  if(command==='manage-execute'){
    const o=parseArgs(args,['plan','workspace','approved-digest','timeout-ms','poll-interval-ms']);if(!o.plan||!o.workspace)throw new SkillError('FILE_REQUIRED','需要 --plan 和 --workspace');
    const result=await executeManagement(await json(o.plan),{workspace:o.workspace,approval:o['approved-digest'],...(o['timeout-ms']?{timeoutMs:Number(o['timeout-ms'])}:{}),...(o['poll-interval-ms']?{pollIntervalMs:Number(o['poll-interval-ms'])}:{})});if(result.status!=='completed')process.exitCode=2;return result;
  }
  if (command === 'help') return { commands: ['doctor [--id ID]','inspect-operation --plan FILE --workspace DIR','health', 'windows', 'tabs --id ID | --name NAME','assess --count N','detail --id ID','manage-prepare --request FILE --out FILE','manage-execute --plan FILE --workspace DIR --approved-digest DIGEST'], note: '连接与管理分开；管理需具体计划和用户授权，不输出登录凭据或 WebSocket 地址' };
  const o = parseArgs(args, command === 'tabs' ? ['id', 'name'] : []);
  const api = new BitAPI();
  if (command === 'health') { await api.post('/health'); return { healthy: true }; }
  if (command === 'windows') {
    const windows = await api.list(); const running = await api.running();
    return windows.map(w => ({ ...w, running: Number(running[w.id]) > 0 }));
  }
  if (command === 'tabs') return withBrowser(o, async (browser, window) => ({ window, tabs: (await listTabs(browser)).map(({ page, ...tab }) => tab) }), { api });
  throw new SkillError('UNKNOWN_COMMAND', '未知命令，运行 help 查看用法');
});
