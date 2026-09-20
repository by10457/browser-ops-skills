import {requestSlot} from './coordination.mjs';
export class SkillError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function localURL(value, protocols = ['http:']) {
  const url = new URL(value);
  if (!protocols.includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) {
    throw new SkillError('NON_LOCAL_ENDPOINT', '仅允许本机浏览器服务地址');
  }
  return url;
}

export class BitAPI {
  constructor(base = process.env.BITBROWSER_API_URL || 'http://127.0.0.1:54345', fetcher = fetch, {coordinate=true} = {}) {
    this.base = localURL(base).origin;
    this.fetcher = fetcher;
    this.coordinate = coordinate;
  }
  async post(path, body = {}, attempt = 0) {
    if (!(this.paths || ['/health', '/browser/list', '/browser/pids/all', '/browser/open']).includes(path)) {
      throw new SkillError('UNSUPPORTED_API', '未提供该接口');
    }
    const delay=Math.max(0,(this.nextRequestAt||0)-Date.now());
    this.nextRequestAt=Date.now()+delay+250;
    if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    if(this.coordinate)await requestSlot(this.base);
    let response;
    try {
      response = await this.fetcher(this.base + path, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(15000), redirect: 'error'
      });
    } catch { throw new SkillError('API_UNAVAILABLE', '比特本地服务不可用或请求超时，请检查软件和本地服务设置'); }
    if (!response.ok) throw new SkillError('API_HTTP_ERROR', `本地接口返回 HTTP ${response.status}`);
    const result = await response.json();
    if (result.success !== true) {
      const message=String(result.msg||result.message||'');
      if(/请求频繁|too many requests|rate.?limit/i.test(message)){
        if(['/health','/browser/list','/browser/pids/all','/browser/detail'].includes(path)&&attempt<3){
          await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
          return this.post(path,body,attempt+1);
        }
        throw new SkillError('RATE_LIMITED','本地接口请求过于频繁，请降低调用频率；写入操作不会自动重试');
      }
      const code=/权限|permission|forbidden/i.test(message)?'PERMISSION_DENIED':/额度|上限|套餐|数量不足|quota|limit/i.test(message)?'QUOTA_EXCEEDED':'API_REJECTED';
      throw new SkillError(code,`比特接口拒绝请求：${path}；请检查客户端权限、额度和参数`);
    }
    return result.data;
  }
  async list() {
    const output = [];
    for (let page = 0; page < 100; page++) {
      const data = await this.post('/browser/list', { page, pageSize: 100 });
      if (!Array.isArray(data?.list)) throw new SkillError('API_SCHEMA_CHANGED', '窗口列表结构发生变化');
      output.push(...data.list.map(({ id, name, seq }) => ({ id, name, seq })));
      if (data.list.length < 100) return output;
    }
    throw new SkillError('LIST_LIMIT', '窗口列表超出本工具的分页上限');
  }
  async running() {
    const data = await this.post('/browser/pids/all');
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new SkillError('API_SCHEMA_CHANGED', '运行窗口结构发生变化');
    return data;
  }
}

export function resolveWindow(windows, { id, name } = {}) {
  if (Boolean(id) === Boolean(name)) throw new SkillError('INVALID_WINDOW_SELECTOR', '请提供唯一的 --id 或 --name');
  const matches = windows.filter(w => id ? w.id === id : w.name === name);
  if (matches.length !== 1) throw new SkillError(matches.length ? 'AMBIGUOUS_WINDOW' : 'WINDOW_NOT_FOUND', '窗口不存在或名称不唯一，请使用真实窗口 ID');
  return matches[0];
}
