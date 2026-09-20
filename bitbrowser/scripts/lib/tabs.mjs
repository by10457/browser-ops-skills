import { SkillError } from './api.mjs';

export async function listTabs(browser) {
  const result = [];
  for (const page of await browser.pages()) {
    const session = await page.createCDPSession();
    let targetId;
    try { targetId = (await session.send('Target.getTargetInfo')).targetInfo.targetId; }
    finally { await session.detach(); }
    result.push({ page, targetId, url: page.url(), title: await page.title() });
  }
  return result;
}

export function selectTab(tabs, { origin, targetId, url } = {}) {
  const matches = tabs.filter(tab => {
    let current;
    try { current = new URL(tab.url); } catch { return false; }
    return (!origin || current.origin === origin) && (!targetId || tab.targetId === targetId) && (!url || tab.url === url);
  });
  if (matches.length !== 1) throw new SkillError(matches.length ? 'AMBIGUOUS_TAB' : 'TAB_NOT_FOUND', '请保留唯一目标标签页，或用 --target 指定本次标签页 ID');
  return matches[0];
}
