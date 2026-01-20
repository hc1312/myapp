# myapp

轻量且互动的前端演示应用（基于 Create React App + React + Ant Design）。本项目集合了多个小游戏、交互式仿真、工具与小型 Web 应用，适合作为作品集展示或原型演示站点（部分需要后端服务，后端代码暂未上传）。

[在线演示]() · [下载 ZIP](https://github.com/hc1312/myapp/archive/refs/heads/master.zip) · [Issues](https://github.com/hc1312/myapp/issues)

---

## 项目简介

myapp 是一个用于演示前端交互能力的单页应用（SPA），集成了棋类、画布交互、小游戏、仿真系统、AI 文字冒险与若干工具类小模块。界面以 Ant Design 为主，兼顾桌面与移动适配，部分路由需要登录并由管理员权限控制。

---

## 项目亮点（按页面 / 路由）

- 首页 — `/`  
  WelcomePage：项目入口，带粒子背景（ParticleBackground），展示项目概览与快速入口。

- 世界杯管理（需要登录 / 管理员权限）  
  - `/TeamManagement`：球队信息管理（创建 / 编辑球队数据）。  
  - `/WorldCupGroups`：分组概览与展示。  
  - `/MatchManagement`：赛程管理与安排。  
  权限说明：上述页面通过 PrivateRoute 保护；UserTable 仅在 `userInfo.role === 'admin'` 时显示管理菜单项。

- 游戏娱乐（公开访问）  
  - `/game/snake` — 贪吃蛇：经典贪吃蛇交互玩法。  
  - `/game/mole` — 打地鼠：点击类小游戏。  
  - `/game/Gomoku` — 五子棋：双人/单人对弈界面。  
  - `/game/BreakoutGame` — 打砖块：基于画布的物理交互。  
  - `/game/CustomStrategyGame` — 自创棋：自定义规则的策略棋类。  
  - `/game/TerrainRPSGame` — 地形版：结合地形机制的策略游戏。  
  - `/CaptiveChessGame` — 俘虏棋（桌面端优化）。  
  - `/rockpaperscissors` — 石头剪刀布。  
  - `/dice2` — 掷骰子游戏：用户为每个点数填写动作，投骰子决定动作（参见 src/dice2.js）。

- 运气 / 策略类（轻量互动）  
  掷骰子 / 石头剪刀布等适合团建或随机决策演示。

- 工具与仿真（部分仅适配桌面端）  
  - `/Elevator` — 电梯模拟：多层电梯调度与状态可视化（控制面板、统计信息）。  
  - `/Subway` — 地铁系统模拟：站点与车辆调度仿真。  
  - `/toy/VirtualShop` — 虚拟商店（需登录）：购物 / 交互演示。  
  - `/toy/WeChatWindow` — 微信风格聊天窗口：社交界面演示。  
  - `/album` — 相册回忆（需登录）：图片浏览 / 管理。  
  - `/messageboard` — 留言板（需登录）：留言与讨论板块。

- AI / 文字冒险  
  - `/AIChat` — 文字冒险 / AI 对话：主题选择、剧情解析与选项交互（使用 ReactMarkdown 渲染，解析 AI 返回的剧情与选项）。

- 节日 / 特效页面  
  - `/NewYearWish`：节日祝福/惊喜页面；包含雪花、动画样式（例如 src/Christmas/snow.css）等视觉特效。

- 账户与权限  
  - `/login` — 登录 / 注册：登录成功后会把 token 与 userInfo 存入 localStorage（含庆祝 confetti 效果）。  
  - 私有页面通过 PrivateRoute 守卫��未登录会重定向到登录页。

- 小部件示例  
  - BalanceCard：示例组件，会周期性从后端拉取用户余额（调用 utils/request 的 API），展示前后端交互封装的示例。

---

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/hc1312/myapp.git
cd myapp
```

2. 安装依赖
```bash
npm install
```

3. 本地启动（开发模式）
```bash
npm start
```
打开 http://localhost:3000

4. 构建生产
```bash
npm run build
```

---

## 项目结构（简要说明）

- public/ — 静态资源（favicon、HTML 等）  
- src/ — 源代码（组件、页面、样式、服务）  
  - src/game/ — 各类小游戏（snake, mole, Gomoku, Breakout 等）  
  - src/worldcup/ — 世界杯相关管理页面（TeamManagement、MatchManagement 等）  
  - src/toy/ — 小型玩具应用（WeChatWindow、VirtualShop 等）  
  - src/ai/ — AIChat （文字冒险与对话）  
  - src/Christmas/ — 节日特效页面（雪花等）  
  - src/utils/ — 请求封装与通用工具（例如 utils/request）  
  - src/dice2.js — 掷骰子示例页面  
- setProxy.js — 本地开发代理（如需与后端联调）  
- webpack.js — 顶层定制/配置脚本（如有特殊构建需求）

---

## 技术栈与关键依赖

- React, React Router, Ant Design（UI）  
- chess.js / react-chessboard（棋类逻辑）  
- react-konva（画布 / 可视化）  
- react-game-engine、react-dice-complete（小游戏 / 交互）  
- react-markdown（剧情 / 文本渲染）  
- axios（HTTP 请求）及 utils/request 封装  
- docx、file-saver（文档导出）  
- canvas-confetti（登录/注册庆祝效果）  

代码主要以 JavaScript 编写，少量 CSS/HTML 用于样式与动画（仓库语言构成见 package.json）。


## 开发与贡献

欢迎贡献：  
- 提交 Issue（功能建议/Bug）  
- Fork -> 新分支 -> 提交 PR（请在 PR 描述中列出改动与演示截图）  
- 建议添加 CONTRIBUTING.md、ISSUE_TEMPLATE、PULL_REQUEST_TEMPLATE 以规范协作流程

要添加页面：在 `src/` 新建模块并在 `src/App.js` 中注册路由与菜单项（示例已在 App.js 中体现）。

---

## 许可证

建议使用 MIT 许可证；如需我可以为仓库添加 LICENSE 文件并提交。

---

## 联系方式

维护者：hc1312  
问题与建议：请在仓库 Issue 提交
