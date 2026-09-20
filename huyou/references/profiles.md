# 用户主页与关注

仅关注帖子作者时，优先使用帖子详情弹窗的按钮，不打开主页。访问用户资料才使用主页接口。所有接口沿用 1–5 秒随机等待。

## 关注帖子作者

在 withHuyou 回调内调用，确保同一窗口的互斥锁覆盖准备与执行：

```js
const plan = await prepareFollowUser(page, binding, {postId});
// 用户已授权关注此作者时执行；开发接口不等于授权关注任意人。
const result = await followUser(page, binding, plan, {workspace});
```

prepare 只打开指定帖子的详情、检查账号、作者、圈子和按钮，返回有效期 15 分钟的计划。帖子须已加载，或它的详情已打开；可先调用 locatePost 加载定位。执行后保留帖子弹窗，可用 closePost 关闭。

verified-ui 表示按钮变为“已关注”；skipped-already-followed 不点击按钮。uncertain 或 blocked-previous-operation 时不得自动重试；可重新 prepare 读取现状。操作记录按当前账号与作者昵称、头像防重，不是作者 UID。昵称或头像会变化，调用方也应维护任务范围，避免重复任务。

## 访问与关闭主页

```js
await withUserProfile(page, binding, {postId}, async visit => {
  const profile = await readUserProfile(visit.page);
  // 分析 profile.name、userId、location、stats、followState。
}); // 回调结束自动关闭本次新开的主页并回到来源页
```

也可分别调用 openUserProfile(page, binding, {postId}) 与 closeUserProfile(visit)，在 try/finally 中回收。visit 是当前进程内的访问句柄，不可保存成 JSON 后复用。打开函数点击帖子作者头像并接收来源页的 popup，核对主页作者；不会复用或关闭用户已有的主页标签。关闭时存在草稿会停止，保留页面供调用方处理。

批量浏览应逐个执行 withUserProfile，避免标签积累。主页超时或目标不符会关闭已取得的本次新标签并报错；弹窗被阻止或迟于超时才出现时，先检查标签再重试。当前入口按帖子作者访问，尚不支持按昵称搜索用户或访问评论者。
