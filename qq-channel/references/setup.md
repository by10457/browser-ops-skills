# 接入

Node.js 版本见 package.json。本包没有运行时第三方依赖；默认使用同级 bitbrowser 技能提供的 Puppeteer 页面，宿主项目按 bitbrowser 的依赖声明安装 puppeteer-core。整个 qq-channel 文件夹可移动，不依赖原父目录名称。

浏览器适配器可通过 `configureBrowser({withBrowser,listTabs})` 注入，或把 QQ_CHANNEL_BROWSER_MODULE 设置为适配器入口的绝对路径。withBrowser(selector,callback) 连接并最终断开，但不关闭用户窗口；listTabs(browser) 返回含 page、targetId、url 的数组。

`withQQChannel({workspace,binding,targetId?}, callback)` 在回调内提供 page、binding、workspace、targetId。读取接口也可直接使用外部 Puppeteer page；传外部 page 时调用方负责互斥和生命周期。动作接口不接受外部 page，始终通过浏览器适配器取得窗口锁。

绑定对象：

```js
{
  browserId: '真实比特窗口 ID',
  channelId: '频道网址中 /g/ 后的标识',
  expectedChannelName: '频道完整名称',
  expectedAccountName: '左侧底部全局昵称',
  expectedChannelAccountName: '发布编辑器中的频道昵称'
}
```

expectedChannelAccountName 在发送时必需；只读可省略。可选 expectedAccountAvatar 用于额外核对全局头像。频道 avatar 只是页面身份证据，不能当作 UID。

仅发现频道时可以使用 `withQQChannel({workspace,binding:{browserId,expectedAccountName},requireContext:false}, ...)` 配合 inspect / listChannels，无需先知道目标频道。频道操作和发送仍必须补全绑定。

binding 也可为配置名称，查找 workspace/config/qq-channel-bindings.json：`{"version":1,"bindings":{"operator":{...}}}`。不要把账号绑定放在技能目录。

workspace 必須显式传入或通过 QQ_CHANNEL_WORKSPACE 指定。动作记录在 workspace/qq-channel/operations，运行记录与计划在 workspace/qq-channel/runs。窗口锁为 workspace/locks/<browserId>.lock；同一窗口的任务应使用相同 workspace。

多个 pd.qq.com 标签时需要 targetId。浏览器断开连接后保留用户页面，不自动关闭或切换其他窗口。
