import path from 'node:path';
import {readJSON,saveJSON,fail} from './core.mjs';
export class Journal {
 constructor(workspace){this.dir=path.join(workspace,'qq-channel','operations');}
 file(key){if(!/^[a-f0-9]{64}$/.test(key))fail('INVALID_KEY','操作标识无效');return path.join(this.dir,key+'.json');}
 async get(key){try{return await readJSON(this.file(key));}catch(e){if(e.code==='ENOENT')return null;fail('JOURNAL_UNREADABLE','操作记录不可读，停止以免重复提交');}}
 async begin(key,value){return saveJSON(this.file(key),value,{exclusive:true});}
 async finish(key,value){return saveJSON(this.file(key),value);}
}
