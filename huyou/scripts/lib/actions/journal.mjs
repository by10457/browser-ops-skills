import { mkdir, open, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fail } from './schema.mjs';
export class Journal {
  constructor(workspace){this.dir=path.join(workspace,'operations');}
  file(key){ if(!/^[a-f0-9]{64}$/.test(key)) fail('INVALID_OPERATION_KEY','操作标识无效'); return path.join(this.dir,`${key}.json`); }
  async get(key){try{return JSON.parse(await readFile(this.file(key),'utf8'));}catch(e){if(e.code==='ENOENT')return null;fail('JOURNAL_UNREADABLE','操作记录损坏，不自动重试');}}
  async begin(key,record){
    await mkdir(this.dir,{recursive:true});
    let h;try{h=await open(this.file(key),'wx');}catch(e){if(e.code==='EEXIST')fail('OPERATION_EXISTS','该操作已有提交记录，禁止重复提交');throw e;}
    try{await h.writeFile(JSON.stringify(record,null,2));await h.sync();}finally{await h.close();}
  }
  async finish(key,record){
    const tmp=this.file(key)+'.'+randomUUID()+'.tmp';const h=await open(tmp,'wx');
    try{await h.writeFile(JSON.stringify(record,null,2));await h.sync();}finally{await h.close();}
    await rename(tmp,this.file(key));
  }
}
