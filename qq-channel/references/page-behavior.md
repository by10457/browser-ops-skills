# 页面匹配与边界

- 频道论坛地址 `/g/<channelId>`，帖子详情 `/g/<channelId>/post/<postId>`；聊天路径 `/text/…` 不受支持。详情链接中的 subc 是来源版块标识，保留原始 URL，不从名称猜路由。
- 我的频道列表为 `.my-guild-item`，名称来自 title / `.item-name`；当前项有 router-link-active。多数项目不直接暴露 href，读取结果不得虚构 channelId。
- 帖子视图为 `.tab-bar__item`，is-active 表示选中。发布版块另由 `.chose-channel-btn` 和 `.plate .choice` 选择。
- 列表为 `.game-guild-main__waterfalls` 虚拟滚动容器。帖子卡片链接有 `.game-guild-main__short-content`；离开视口的卡片可能消失。查询累计 ID，而非累计当次 DOM 数量。
- 详情顶层评论 ID 以 c_ 开头，回复以 r_ 开头，同一 `.comment-list` 容器保留父级关系。回复入口 `.comment-list-item__rely`；选中后文字变为“回复中”，编辑器标题显示回复作者和内容。
- 全局身份读取 `.app-login`，频道内身份读取激活后 `.editor-header .user-name` 及头像。频道身份异步加载，必须等待匹配预期昵称。
- 详情导航后账号容器可能先出现空内容，等待昵称和头像地址加载后才核对身份。折叠发布框的提示文字不是频道昵称。
- 发布版块可能带 `.choice.disabled`；准备计划时检查禁用状态，不能把列表中可浏览的版块当作可发布版块。选中后等待发布框实际版块名称更新。
- 编辑器为 ProseMirror `[data-exeditor-root]`。读取文字排除占位 widget 和尾部 br，保留段落换行；不能把占位文案当作草稿。
- 详情点赞位于 `.bottom-right .like-container`。`#like` 空心图标表示未点赞，`#like-active` 表示已点赞；也接受明确 aria-pressed=true 或“已点赞”文案。数量增加本身不作为当前账号已点赞证据。
- 零评论详情显示 `.has-no-comment`，可作为评论区已加载且为空的证据，不要求评论数量控件存在。
- 当前正文解析支持已观察到的短帖详情布局。不同长文布局、未渲染附件、折叠回复或权限限制可能导致读取不完整，应检查结果及 warnings，不宣称全站覆盖。

- 刷新帖子通过 `.tab-bar__item` 切换并返回原类型，不调用整页刷新；选中状态读取 `.is-active`。切换成功不等同于服务器数据已全部更新。
- 回顶部对列表 `.game-guild-main__waterfalls` 或详情 `.feed-content` 执行 scrollTo，并验证 scrollTop 接近零，不修改侧栏位置。

这些规则仅描述可见 DOM，不依赖 Vue 内部对象、私有接口、请求签名或页面缓存状态。新增布局应先观察再添加解析器和测试。
