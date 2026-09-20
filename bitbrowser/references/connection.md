# 连接协议与边界

通过 `/browser/list` 分页查询窗口，`/browser/pids/all` 检查运行状态，`/browser/open` 获取连接地址，再由 puppeteer-core 连接已有浏览器。结束时 disconnect，保留窗口和登录环境。

获取地址前后核对进程 ID，变化时停止。状态查询与 open 调用并非原子操作；若窗口被同时关闭，本地服务可能重新启动它。调用方应避免同时关闭正在连接的窗口。

接口契约：list 返回 `{success:true,data:{list:[...]}}`；pids/all 返回 `{success:true,data:{窗口ID:进程ID}}`。结构不匹配时报错。窗口 ID 与标签页 targetId 是不同标识，不可互换。

参考：[本地服务指南](https://doc2.bitbrowser.cn/jiekou/ben-di-fu-wu-zhi-nan.html)、[浏览器接口](https://doc.bitbrowser.cn/api-jie-kou-wen-dang/liu-lan-qi-jie-kou)、[断开连接](https://pptr.dev/api/puppeteer.browser.disconnect)。
