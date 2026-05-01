# SciPaper Todo

本地优先的科研论文写作 IDE。Electron + React + TypeScript。

> Local-first scientific manuscript IDE with built-in AI co-authoring (multi-provider), MCP server, Zotero integration, and a daily-progress dashboard.

## 它是什么

把"写论文这件事"做成一个全流程工作台：

- **写作**：分章节（Title / Abstract / Intro / Methods / Results / Discussion / References），文本块 + 图片 + 附件块。
- **AI 协同**：内置多 Provider AI 助手（OpenAI 兼容 + Anthropic 协议），工具调用走 approval flow，每一次写改都看得见、可拒绝。
- **MCP server**：把这个 app 的所有数据 / 写操作开放给任意 MCP 客户端（Claude Code、Cursor、Claude.ai 等）。包括 `today/inbox` 资源 + `today-checkin` prompt，让 LLM 帮你填 plan / 心情 / 番茄钟 / 时间线 / 收尾总结。
- **每日仪表盘**：今日 N 项进展、字数/连续/专注/心情、番茄钟（15/25/45 分段切换）、今日时间线（一句话记一笔）、月度热力图（GitHub 风格 16 周）。
- **导出**：docx（学术英文 / 中文学位论文 / Nature 三模板，可选用 LLM 套斜体规范）、HTML、JSON、分享包。
- **Zotero 集成**：本地 Zotero MCP 客户端，搜文献、读 abstract / fulltext、按 collection 组织。
- **海报生成**：今日工作进展生成今日海报（Claude 浅色 / Pixel 黑白 / Fresh 绿色三主题）。

## 下载

去 [Releases](https://github.com/1690834643/scipaper-todo-app/releases) 拿最新版：

- `SciPaper Todo-Setup-x.x.x.exe` — Windows 安装版（NSIS）
- `SciPaper Todo-Portable-x.x.x.exe` — Windows 便携版，免安装直接双击

只支持 Windows x64。macOS / Linux 暂未打包。

## 从源码跑

```bash
npm install
npm run dev          # 开发模式（vite + electron 热重载）
npm run build        # 仅打 renderer
npm run dist:win     # 出 Setup + Portable 双 .exe
npm run lint         # ESLint，max-warnings=0
npm run test         # vitest
```

需要 Node 20+ 和能跑 electron-builder 的环境。WSL 下能编译，但 Electron GUI 跑不动，需要在原生 Windows 实机里跑 dev / 打开 .exe。

## 数据存哪

所有数据落本地 JSON 文件：

- Windows 安装版：`%APPDATA%/scipaper-todo/database.json`
- Windows 便携版：可执行文件同目录的 `data/database.json`

写入是原子的（写到 `.tmp` 后 rename），并周期 cooldown 滚一份 `.bak` 历史副本。

## MCP server

app 启动时同时跑一个 stdio MCP server。配置示例（Claude Code / Cursor / Codex）：

```json
{
  "mcpServers": {
    "scipaper-todo": {
      "command": "node",
      "args": ["<path-to-todo>/electron/mcp-server-cli.cjs"]
    }
  }
}
```

详见 [docs/](./docs/) 里的 MCP 配置说明。

## 架构概览

```
electron/
  main.cjs              # Electron main process + IPC handlers
  preload.cjs           # contextBridge → window.scipaper
  storage.cjs           # JSON DB CRUD（atomic write + .bak）
  llmClient.cjs         # OpenAI-compat / Anthropic / streaming
  llmTools.cjs          # ~50 个工具的 schema 定义
  toolRouter.cjs        # 工具调用 dispatch + approval gate
  llmSystemPrompt.cjs   # 上下文注入（current article / section）
  mcp-server.cjs        # MCP stdio server（资源 + 工具 + prompts）
  docxExporter.cjs      # docx 三模板渲染 + LLM 套斜体
  zoteroClient.cjs      # Zotero local MCP client
src/
  App.tsx               # 主应用 / IPC 调用 / state 管理
  components/           # 各功能 panel
  styles/               # 三主题（claude / pixel / fresh）
  utils/                # word counter / streak tracker / bibtex
```

## License

MIT。代码可自由使用，但请保留原作者署名。
