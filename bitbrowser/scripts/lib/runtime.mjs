import {createRequire} from 'node:module';
import path from 'node:path';
import {SkillError} from './api.mjs';
export function loadPuppeteer(){
  const roots=process.env.SKILL_PROJECT_ROOT
    ? [createRequire(path.join(path.resolve(process.env.SKILL_PROJECT_ROOT),'package.json'))]
    : [createRequire(import.meta.url),createRequire(path.join(process.cwd(),'package.json'))];
  for(const require of roots){
    try{return require('puppeteer-core');}
    catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
  }
  throw new SkillError('DEPENDENCY_MISSING','请在项目根目录安装 puppeteer-core@25.11.0；技能在项目外时设置 SKILL_PROJECT_ROOT 指向项目根目录');
}
