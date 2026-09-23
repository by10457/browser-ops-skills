# 操作、图片与恢复

prepare 不上传图片或发送内容。发布和回复会打开空编辑器以确认频道内身份；设置 directPostPreparation 且完整绑定身份的评论/点赞可直接进入目标帖子，无须每帖返回频道。它生成 15 分钟有效的完整计划；不要手动修改计划正文、绑定、图片信息或摘要。

图片以本地绝对路径输入，支持 PNG、JPEG、WebP、GIF。按文件签名读取类型并记录 SHA-256、字节数和顺序。执行前重新读取校验；首版不接受远程 URL、视频或评论附件。正文不能为空；不支持纯图片帖子。

上传逐张进行，每张等待新增且加载完成的 HTTPS 预览，再上传下一张。图片数量不设未观察到的“平台上限”；网站拒绝、图片超限或预览仍为 blob 地址时返回 UPLOAD_UNVERIFIED / UPLOAD_FAILED，并保留现场。上传预览和提交按钮是页面证据，不是服务端落库保证。

## 提交与去重

提交前复核账号、目标、正文、版块、回复提示及图片预览，并持久化 pending 记录。首次提交后超时或记录更新失败均归为 uncertain。相同窗口、账号、频道、目标和内容重复执行时，成功历史会跳过，未决历史会阻止重发。

点赞只在明确未点赞时点击。已点赞跳过，无法确认停止。评论/回复需看到新出现的本人评论 ID、完整文字和父级关系；发帖需看到新出现的本人帖子卡片。verified-ui 只表示页面核验通过，不保证后台最终持久化。

## 结果核对

`executeInteraction({workspace,targetId,plan,mode:'reconcile'})` 使用既有提交前基线核对，可使用过期计划，但绝不点击提交。优先读取当前现场；需要导航而现场有草稿时停止。找不到新结果或本人身份无法确认则保持 uncertain。

`listOperations({workspace})` 返回已有记录。运行目录保存 plan.json / result.json，输入阶段另存 draft.json；异常时尽力保存截图。不保存 Cookie 或登录令牌。

首版不提供删除记录、自动解除防重或跨进程清理附件的接口。遇到已有草稿、上传失败或未决提交时，Agent 应读取运行记录和页面，先核对是否已发送，再由操作者处理草稿。清空编辑器不能证明先前未提交。

## 常见停止原因

|错误|处理|
|---|---|
|AMBIGUOUS_TAB|列出窗口标签并指定 targetId|
|ACCOUNT_MISMATCH / CHANNEL_MISMATCH|核对绑定和实际页面，不能仅修改期望值来绕过|
|CHANNEL_ACCOUNT_REQUIRED|补充发布编辑器实际显示的频道内昵称|
|CHANNEL_ACCOUNT_MISMATCH|核对当前编辑器身份和对应动作绑定，勿直接改期望值绕过|
|EXISTING_DRAFT|保留现场，确认草稿归属|
|IMAGE_CHANGED|文件变化后重新准备计划，不复用旧摘要|
|UPLOAD_UNVERIFIED|检查图片预览和上传提示，不直接点击发表|
|LIKE_STATE_UNKNOWN|读取实际图标和状态，未确认前不切换|
|PLATFORM_BLOCKED|停止任务，由用户处理验证或权限问题|
|blocked-uncertain / uncertain|使用原计划核对；不换文件夹绕过记录|
# 发布后的页面位置

executeInteraction 执行 publish 并取得 verified-ui 后，自动通过频道导航返回列表，执行类型初始化。returnToChannel.status 为 returned 或 failed；导航失败仍保留 verified-ui 和帖子证据，不能再次发布。未确定成功、重复执行阻断及 reconcile 不自动跳转。
