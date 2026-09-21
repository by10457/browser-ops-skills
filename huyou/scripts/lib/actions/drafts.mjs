import path from 'node:path';
import {Journal} from './journal.mjs';
import {hash,fail} from './schema.mjs';

// Separate from submission records: owning a draft never proves a submission.
export class DraftStore extends Journal {
  constructor(workspace){super(workspace);this.dir=path.join(workspace,'drafts');}
  async save(key,record){if(await this.get(key))await this.finish(key,record);else await this.begin(key,record);}
}
export function assertOwnedDraft(record,plan,targetId){
  if(!record||record.status!=='owned'||record.planDigest!==plan.digest||hash(record.binding)!==hash(plan.binding)||!targetId||record.targetId!==targetId||record.text!==plan.task.content?.text)
    fail('DRAFT_NOT_OWNED','没有与计划、窗口和标签一致的完整草稿记录；拒绝清理');
}
