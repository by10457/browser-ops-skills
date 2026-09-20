# 独立接入

整个 bitbrowser 目录就是分发单元，保留 SKILL.md、package.json、scripts、references、examples、agents 和 tests。可移动或重命名外层目录；不依赖其他技能、父目录文档或固定项目名称。不要复制 node_modules、真实账号配置或运行记录。

运行环境和依赖版本由本目录 package.json 声明。需要 Node.js 22.12+。在宿主项目根目录安装 puppeteer-core@25.11.0，例如 `npm install puppeteer-core@25.11.0`。不要在技能目录运行安装命令。查询本地 API 不依赖 Puppeteer，连接窗口和标签操作需要它。

如果技能位于宿主项目之外，设置环境变量 SKILL_PROJECT_ROOT 为宿主项目的绝对路径。脚本先用该位置解析依赖；未设置时从模块所在位置和当前工作目录查找。

从技能目录运行 `node scripts/cli.mjs doctor`。其他 Agent 可通过本技能 scripts/index.mjs 的绝对路径或 file URL 导入公开函数。workspace 由调用方显式传入，用于计划、操作记录和窗口锁；独立于技能目录。

默认连接本机 127.0.0.1:54345。BITBROWSER_API_URL 可设置其他本机端口。同一电脑上，多实例默认使用系统临时目录中的 bitbrowser-skill-coordination 协调请求；BITBROWSER_COORDINATION_DIR 可显式指定共享位置。所有实例必须使用同一协调目录及一致的服务地址才能协调。不要在任务间清空仍在使用的协调目录。
