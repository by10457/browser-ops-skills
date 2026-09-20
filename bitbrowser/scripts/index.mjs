export {withBrowser,BitAPI,SkillError,resolveWindow,listTabs,selectTab} from './lib/session.mjs';
export {ManagementAPI,assessWindows,getWindow,prepareManagement,executeManagement} from './management.mjs';
export {doctor,inspectOperation} from './diagnostics.mjs';
import {BitAPI} from './lib/api.mjs';
export async function listWindows({api=new BitAPI()}={}){const windows=await api.list(),running=await api.running();return windows.map(w=>({...w,running:Number(running[w.id])>0}));}
export async function health({api=new BitAPI()}={}){await api.post('/health');return {available:true};}
