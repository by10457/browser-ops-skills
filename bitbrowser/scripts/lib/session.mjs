import {loadPuppeteer} from './runtime.mjs';
import { BitAPI, SkillError, resolveWindow, localURL } from './api.mjs';
export { BitAPI, SkillError, resolveWindow } from './api.mjs';
export { listTabs, selectTab } from './tabs.mjs';

// Never launch or close a browser. /open is used only after checking its live PID.
export async function withBrowser(selector, callback, { api = new BitAPI(), connect } = {}) {
  if(!connect){const puppeteer=loadPuppeteer();connect=puppeteer.connect.bind(puppeteer);}
  const window = resolveWindow(await api.list(), selector);
  const before = await api.running();
  if (!(Number(before[window.id]) > 0)) throw new SkillError('WINDOW_NOT_RUNNING', '窗口未运行，请先执行 start 管理操作或手动启动');
  const opened = await api.post('/browser/open', { id: window.id });
  if (!opened?.ws) throw new SkillError('NO_ENDPOINT', '接口未返回浏览器连接地址');
  localURL(opened.ws, ['ws:']);
  const after = await api.running();
  if (String(before[window.id]) !== String(after[window.id])) throw new SkillError('WINDOW_RESTARTED', '获取连接期间窗口进程发生变化，停止读取');
  let browser;
  try { browser = await connect({ browserWSEndpoint: opened.ws, defaultViewport: null, protocolTimeout: 15000 }); }
  catch { throw new SkillError('CONNECT_FAILED', '无法连接已有窗口，请检查窗口运行状态'); }
  try { return await callback(browser, { ...window, pid: Number(after[window.id]) }); }
  finally { await browser.disconnect(); }
}
