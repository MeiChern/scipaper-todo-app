# 当前状态

## 版本与产物

- 1.0.15 已 ship → `/mnt/c/Users/自动挡赛车手/Desktop/SciPaperTodo-fixed-1.0.1-20260430/` (Setup + Portable, 各 ~97 MB)
- 1.0.11 / 1.0.12 / 1.0.13 / 1.0.14 也在桌面（同目录下，留最新即可）
- TS check：`cd /home/nee/todo && npx tsc -b` → 零错误
- Vite build：93 KB CSS / 412 KB JS / 65 modules
- 完整打包：`npm run dist:win` ~90 秒

每次发版的固定步骤（**必须 cd 到 /home/nee/todo 后再 npm**，否则 ENOENT）：

1. `cd /home/nee/todo && npm run build:renderer`（零 TS 错误）
2. `package.json` 版本号递增（1.0.15 → 1.0.16）
3. `npm run dist:win`
4. `cp release/*-1.0.X.exe "/mnt/c/Users/自动挡赛车手/Desktop/SciPaperTodo-fixed-1.0.1-20260430/"`

## 目录结构

```
electron/
├── main.cjs              # IPC 注册，30+ handlers
├── preload.cjs           # contextBridge 暴露 window.scipaper
├── storage.cjs           # 1700+ 行，JSON 数据库 + 30+ CRUD + LCS diff
├── llmPresets.cjs        # 1.0.14 起两个预设：DeepSeek V4 Flash + Pro
├── llmKeyStore.cjs       # safeStorage 加密 API key
├── llmTools.cjs          # 22 + 5 zotero = 27 个 tool 定义（单一来源）
├── llmSystemPrompt.cjs   # buildSystemPrompt 拼 system prompt
├── llmClient.cjs         # 流式 + agent loop + 双协议 + reasoning_content
├── toolRouter.cjs        # tool 执行 + JSON schema 校验 + Zotero 分发
├── writingScenarios.cjs  # 8 个内置 scenario prompt（单独文件）
├── zoteroClient.cjs      # 直连 localhost:23119
├── docxExporter.cjs      # 1.0.13 重构,3 模板 + inline `*x*` italic parser + LLM 联动,~410 行
└── mcp-server.cjs        # 已重构，从 llmTools.cjs 消费（单一来源）

src/
├── App.tsx               # 主路由 + 全局状态机
├── types.ts              # 接口定义
├── global.d.ts           # window.scipaper 类型
├── styles/                # 15 个 css 文件
│   ├── ai-drawer.css     # AI 右侧 drawer + module-grid + share card
│   └── ...
├── components/
│   ├── AIAssistantPanel  # 右侧 drawer，可拖拽宽，scenario 下拉
│   ├── ApprovalDialog    # 写操作确认 modal
│   ├── ShareCard         # Canvas 1080x1440 海报，三主题
│   ├── ProviderManager   # AI Provider CRUD + 测试连接
│   ├── ScenarioLibrary   # 8 个内置 + 自定义 scenario 管理
│   ├── ItalicGuidePanel  # 1.0.11 新增,拉丁斜体规范 prompt 编辑
│   ├── ZoteroConfigPanel # 1.0.11 新增,Zotero 接入配置
│   ├── AppSidebar        # 1.0.12 加了 AI 助手按钮 (✦ 图标 + ⌘K aside)
│   ├── SettingsView      # 7 卡网格 (主题/存储/AI/场景/拉丁/Zotero/MCP)
│   ├── InsightsView      # 4 卡网格 + "✨ 生成今日海报" 按钮
│   └── ...
└── utils/
    ├── wordDiff.ts       # LCS 字符级 diff（中英文）
    ├── jokesAndAnalogies.ts  # 60+ 俏皮话 + 字数类比表
    └── articleUtils.ts   # 字数 / 相对时间 / 状态标签
```

## 不要碰的东西

- 主题机制 `<html data-theme="claude|pixel|fresh">`，token 在 `tokens.css`
- storage.cjs 的 JSON 数据格式 — 加字段必须 optional + 默认值
- 5 路由 IA：Home / Library / Article / Insights / Settings，共享 AppSidebar
- 已删的旧组件 SearchPanel / SharePanel / ExportPanel / WordCountStats，**不要重新引入**
- 当前依赖：`@modelcontextprotocol/sdk` + `react` + `react-dom` + `utif` + `docx`（1.0.11 新增），不要无确认装新依赖
- AI 助手快捷键 `Ctrl/Cmd+K` 不要动；1.0.12 加的 sidebar 按钮是补充入口不是替代

## 数据迁移

老用户的 `~/Documents/SciPaperTodo/database.json` 可能没有：

- `llmProviders` / `activeLlmProviderId` / `writingScenarios` / `italicGuide` / `zoteroConfig`

`normalizeStoredDatabase` 已经处理向后兼容，缺字段会用默认值植入。`streakHistory` 旧数据每条只有 `{date, words, goalMet}`，新字段会被 normalize 时填默认（`addedWords = words` 当 fallback）。
