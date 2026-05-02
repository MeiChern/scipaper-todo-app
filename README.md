<h1 align="center">SciPaper Todo</h1>

<p align="center">
  <strong>本地优先的科研论文写作 IDE · Local-first scientific manuscript IDE</strong>
</p>

<p align="center">
  <a href="https://github.com/1690834643/scipaper-todo-app/releases/latest"><img src="https://img.shields.io/github/v/release/1690834643/scipaper-todo-app?style=flat-square&color=2ea44f" alt="release"></a>
  <a href="https://github.com/1690834643/scipaper-todo-app/releases/latest"><img src="https://img.shields.io/badge/platform-Windows%20x64%20%7C%20macOS-0078D6?style=flat-square" alt="platform"></a>
  <img src="https://img.shields.io/badge/electron-37-47848F?style=flat-square" alt="electron">
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square" alt="react">
  <img src="https://img.shields.io/badge/MCP-stdio-F46036?style=flat-square" alt="mcp">
</p>

<p align="center">
  <a href="#中文"><strong>中文说明</strong></a> ·
  <a href="#english"><strong>English</strong></a> ·
  <a href="https://github.com/1690834643/scipaper-todo-app/releases/latest"><strong>下载 / Download</strong></a>
</p>

---

## 中文

### 这是什么

**SciPaper Todo** 是一款面向生命科学研究者的桌面应用，把"写论文"当成一个软件工程项目来管理：

- 一篇论文 = 一个仓库，按 IMRaD 结构组织（Title / Abstract / Introduction / Methods / Results / Discussion / References）
- 数据本地，不上云；附件、版本、修改记录全部留在你机器上
- 内置 MCP 服务器，让 Cursor / Claude Code / Claude Desktop 直接读写你的论文
- 可选接入大模型（DeepSeek 等），AI 助手懂当前章节、当前学科、当前审稿轮次
- 支持 Word 导出，可一键 LLM 自动按学术规范打斜体（`*Chilo suppressalis*` / `*p* < 0.05`）
- Zotero 直连，文献检索 / 全文 / 批注 都能在 AI 对话里自然调用

### 核心特色

| 特色 | 说明 |
|---|---|
| 🧠 **MCP 双向协议** | 内置 stdio MCP server 暴露 68 个工具（本地写作、进展记录、导出、Zotero 等），任何兼容 MCP 的 AI 客户端都能查/写你的论文 |
| 📚 **IMRaD 一等公民** | 创建论文先回答 4 个研究问题（科学问题 / 现象 / 假设 / 方案），自动生成七章节骨架；ContentBlock 支持文本 / 图片 / 文件链接，每次修改自动版本快照 |
| 🤖 **内置 AI 助手 + 8 场景** | 右侧 Cmd+K Drawer，预置 Abstract / Introduction / Methods / Results / Discussion / Conclusion / Reply Reviewer / Distill 八个场景 prompt，可自定义；支持 OpenAI 与 Anthropic 双协议、思考模式（reasoning_content）流式渲染、工具调用 + 二次确认 |
| 📝 **docx 三模板 + 拉丁斜体规范** | Times New Roman 通用学术 / 宋体 1.5 行距中文学位 / Arial 紧凑 Nature 风格三套模板；勾选"套斜体规范"即可让 LLM 在导出前按学术英语惯例自动给学名 / 拉丁短语 / 统计变量打斜体 |
| 📖 **Zotero 集成** | 通过 zotero-mcp-plugin 直连本地 Zotero（不限版本，6 / 7 / 8 都支持），library 检索 / collection 浏览 / item 详情 / 全文 / 批注 五种查询能力 |
| 🔍 **审稿工作流** | 多轮 ReviewRound + Major/Minor 意见分类 + Revision 关联到具体 ContentBlock + 一键生成回复信草稿 |
| 🎨 **多主题 + 海报分享** | claude / pixel / fresh 三主题 token 化切换；1080×1440 写作打卡海报（含 Latin 引文、印章、波浪线、渐变进度条） |
| 💾 **本地数据安全** | JSON 数据库 + 原子写入（.tmp + rename）+ 5 分钟周期 .bak 备份 + safeStorage 加密的 API Key |
| 🔥 **写作激励** | streak 连续打卡 / 番茄钟会话计数 / 打字字数 / 心情记录 / 每日字数目标 |

### 安装与使用

1. 到 [Releases](https://github.com/1690834643/scipaper-todo-app/releases/latest) 下载：
   - **Windows Setup**：标准 NSIS 安装包，会写入 Start Menu / 卸载条目
   - **Windows Portable**：单文件免安装版，双击即用
   - **macOS DMG**：按芯片选择 `arm64` 或 `x64`，打开 dmg 后拖到 `/Applications`
2. macOS Homebrew Cask（tap 发布后）：
   ```sh
   brew install --cask 1690834643/scipaper-todo/scipaper-todo
   ```
3. 首次启动会在 `~/Documents/SciPaperTodo/`（macOS / Linux）或 `%USERPROFILE%\Documents\SciPaperTodo\`（Windows）创建数据目录
4. 进 **Settings → AI Provider** 添加你的 LLM（DeepSeek V4 Flash / Pro 已内置预设，粘贴 API Key 即可）
5. 进 **Settings → Zotero 接入**（可选）启用 Zotero 集成
6. 进 **Settings → MCP 协议** 复制配置粘到 Cursor / Claude Code 即可在外部 AI 里读写论文
   - 🍎 **macOS MCP 推荐用 Node 跑打包内的 CLI**。这避开 `.app/Contents/MacOS/...` GUI 路径和空格兼容性问题，但要求系统里有 `node`：
     ```json
     {
       "mcpServers": {
         "scipaper-todo": {
           "command": "node",
           "args": ["/Applications/SciPaper Todo.app/Contents/Resources/app.asar.unpacked/electron/mcp-cli.cjs"],
           "env": { "SCIPAPER_MCP_CLIENT": "Claude Code" }
         }
       }
     }
     ```
   - ⚠️ **Windows MCP 配置请用 Setup 版的 .exe**。Portable 版每次启动都会解压到 `%LOCALAPPDATA%\Temp\<随机 hash>\` 一个临时目录，关闭后通常被回收；MCP 配置写的临时路径下次启动就失效。要么用 NSIS Setup（路径固定），要么把 Portable .exe 自己拷到 `C:\Tools\SciPaperTodo\` 这种固定文件夹，MCP 配置指向那个稳定路径。
   - 🐧 **WSL / Linux 用户用 Node 直接跑 MCP**：源码里有一个 `electron/mcp-cli.cjs` 是不带 Electron 壳的 stdio MCP 入口。把客户端 (Claude Code in WSL / Cursor in WSL) 的 MCP 配置改成：
     ```json
     {
       "mcpServers": {
         "scipaper-todo": {
           "command": "node",
           "args": ["/home/<you>/path/to/scipaper-todo/electron/mcp-cli.cjs"],
           "env": { "HOME": "/mnt/c/Users/<your-windows-user>" }
         }
       }
     }
     ```
     `HOME` 这一行是关键——MCP server 默认从 `$HOME/Documents/SciPaperTodo/database.json` 读数据；指到 Windows 用户目录后，WSL 端的 MCP 跟 Windows 桌面应用读同一份数据库。两端写入是用 sentinel-file 锁保护的（`database.json.lock`，O_CREAT\|O_EXCL；超过 30 s 自动清理），同时写不会导致互覆盖——失败的那一方会拿到清晰的"被锁住，请重试"错误。不需要 Windows .exe 桥接。

### 技术栈

- **桌面壳**：Electron 37（Chromium 130+，原生 Canvas 2D L2 / safeStorage / contextBridge 全用上）
- **渲染层**：React 19 + TypeScript 6 + Vite 8（65 modules，gzipped JS 127 KB）
- **存储**：本地 JSON 数据库 + safeStorage 加密 API Key
- **AI 协议**：OpenAI-compat 与 Anthropic 双协议流式，支持 thinking mode 的 `reasoning_content` 重放
- **MCP**：基于 `@modelcontextprotocol/sdk` 的 stdio server
- **导出**：`docx` v9 纯 JS 包，无 native 依赖
- **打包**：electron-builder 出 NSIS + Portable 双产物，每次约 90 秒

### 路径速查

```
~/Documents/SciPaperTodo/                  # macOS / Linux
%USERPROFILE%\Documents\SciPaperTodo\      # Windows
├── database.json           # 主数据库（原子写入）
├── database.json.bak       # 5 分钟周期备份
├── Articles\
│   └── {ArticleId}\
│       ├── Attachments\    # 复制进来的图片 / 数据文件
│       └── Exports\        # 导出的 docx / md
└── Theses\                 # 学位论文（聚合多篇 article）
```

### 谁适合用

- 生命科学博士生 / 博后 / 青年 PI（默认场景）
- 任何 IMRaD 写作者，特别是要管理 **多篇并行 + 多轮审稿** 的人
- 想把 AI 真正接到自己写作流程里、又不愿把数据交给云的人

### 反馈与已知

- macOS 构建已配置 dmg/zip；正式对外发布前需要 Developer ID 签名和 notarization，否则首次启动仍会遇到 Gatekeeper 提醒
- 旧 `deepseek-chat` / `deepseek-reasoner` model id 已在 V4 文档里被标记为 legacy；预设直接给 `deepseek-v4-flash` / `deepseek-v4-pro`
- WSL 下 safeStorage 拒保存 API Key（Windows 实机用 DPAPI 正常）；如遇此情况只在 Windows 跑
- **Portable .exe 用作 MCP server 路径不稳定**：Windows portable NSIS 会把 .exe 自解压到 `%LOCALAPPDATA%\Temp\<随机 hash>\`，关闭后被清理，hash 每次启动可能变；任何外部 MCP 客户端把这个临时路径写死，下次连接就会找不到。要把 SciPaper Todo 当 MCP 服务器，请用 Setup 版（路径固定到安装目录），或把 Portable .exe 拷到自己常驻的固定文件夹再在 MCP 配置里指向那条路径。

---

## English

### What is this

**SciPaper Todo** is a desktop app for life-science researchers that treats manuscript writing like a software project:

- One paper = one repository, organised by IMRaD (Title / Abstract / Introduction / Methods / Results / Discussion / References)
- Local-first. Attachments, versions, edit history all stay on your machine
- Built-in MCP server lets Cursor / Claude Code / Claude Desktop read and write your manuscripts directly
- Optional LLM integration (DeepSeek and others). The assistant knows your current section, field, and review round
- Word export with one-click LLM auto-italicisation per academic conventions (`*Chilo suppressalis*` / `*p* < 0.05`)
- Direct Zotero integration: search, fulltext, annotations all callable from chat

### Key features

| Feature | What it does |
|---|---|
| 🧠 **Bidirectional MCP** | Built-in stdio MCP server exposes 68 tools across local writing, progress logging, exports, Zotero, and more. Any MCP-compatible AI client can query and write to your manuscripts |
| 📚 **IMRaD as a first-class citizen** | Creating a paper starts with 4 research questions (problem / phenomenon / hypothesis / approach) that auto-generate the 7-section skeleton. Content blocks support text / image / file link, with automatic version snapshots on every edit |
| 🤖 **Built-in AI drawer + 8 scenarios** | Right-side Cmd+K drawer with preset prompts for Abstract / Introduction / Methods / Results / Discussion / Conclusion / Reply Reviewer / Distill, all customisable. OpenAI and Anthropic protocols, streaming `reasoning_content` for thinking-mode models, tool-calling with confirm-before-write |
| 📝 **3 docx templates + Latin italic guide** | Times New Roman academic / SimSun 1.5-spacing thesis / Arial Nature-style. Tick "apply italic guide" and the exporter calls the LLM to mark italics on species names, Latin phrases, and statistical variables before writing the docx |
| 📖 **Zotero integration** | Via zotero-mcp-plugin (works with Zotero 6/7/8): library search, collection browsing, item details, fulltext, annotations |
| 🔍 **Review workflow** | Multiple ReviewRounds, Major/Minor tagging, Revisions linked to specific ContentBlocks, one-click response-letter draft |
| 🎨 **Themes + share posters** | Three token-based themes (claude / pixel / fresh). Generates 1080×1440 daily-writing posters with Latin epigraph, seal, waveform, gradient progress |
| 💾 **Safe local storage** | JSON database with atomic writes (.tmp + rename), rolling 5-minute .bak snapshot, API keys encrypted via safeStorage |
| 🔥 **Writing motivation** | Streak counter, pomodoro session log, daily word target, mood log, typing-burst stats |

### Install

1. Grab from [Releases](https://github.com/1690834643/scipaper-todo-app/releases/latest):
   - **Windows Setup**: standard NSIS installer with Start Menu and uninstall entry
   - **Windows Portable**: single-file binary, no install
   - **macOS DMG**: choose `arm64` or `x64`, open the dmg, and drag the app to `/Applications`
2. Homebrew Cask, once the tap is published:
   ```sh
   brew install --cask 1690834643/scipaper-todo/scipaper-todo
   ```
3. First launch creates `~/Documents/SciPaperTodo/` on macOS / Linux, or `%USERPROFILE%\Documents\SciPaperTodo\` on Windows
4. **Settings → AI Provider**: add your LLM (DeepSeek V4 Flash / Pro presets included, paste your API key)
5. **Settings → Zotero** (optional): enable Zotero integration
6. **Settings → MCP**: copy the config block into Cursor / Claude Code to give external AIs access
   - 🍎 **On macOS, run the packaged CLI with Node for MCP.** This avoids `.app/Contents/MacOS/...` GUI paths and spaces, but requires `node` on the system:
     ```json
     {
       "mcpServers": {
         "scipaper-todo": {
           "command": "node",
           "args": ["/Applications/SciPaper Todo.app/Contents/Resources/app.asar.unpacked/electron/mcp-cli.cjs"],
           "env": { "SCIPAPER_MCP_CLIENT": "Claude Code" }
         }
       }
     }
     ```
   - ⚠️ **On Windows, use the Setup .exe for MCP integration, not Portable.** Portable launches by self-extracting to `%LOCALAPPDATA%\Temp\<random-hash>\` and the hash changes between runs; an MCP config pinned to that temp path breaks the next time you reopen the app. Either install via NSIS Setup (stable install path), or copy the Portable .exe into a fixed folder such as `C:\Tools\SciPaperTodo\` and point your MCP config there.
   - 🐧 **WSL / Linux: skip the .exe bridge and run the MCP server natively via Node.** The repo ships `electron/mcp-cli.cjs`, an Electron-free stdio MCP entry. Point your WSL-side client at:
     ```json
     {
       "mcpServers": {
         "scipaper-todo": {
           "command": "node",
           "args": ["/home/<you>/path/to/scipaper-todo/electron/mcp-cli.cjs"],
           "env": { "HOME": "/mnt/c/Users/<your-windows-user>" }
         }
       }
     }
     ```
     The `HOME` override is what makes the WSL-side MCP read the same `Documents/SciPaperTodo/database.json` your Windows GUI writes. Concurrent writes are guarded by a sentinel-file lock (`database.json.lock`, `O_CREAT|O_EXCL`, auto-reclaimed after 30 s of staleness): the loser of a race gets a clear "DB is locked, retry" error rather than a silent overwrite. No `.exe` is involved on this path.

### Stack

- **Shell**: Electron 37 (Chromium 130+, uses Canvas 2D Level 2, safeStorage, contextBridge)
- **Renderer**: React 19 + TypeScript 6 + Vite 8 (65 modules, ~127 KB gzipped JS)
- **Storage**: local JSON database + encrypted API key store
- **AI**: dual-protocol streaming (OpenAI-compat + Anthropic), with `reasoning_content` replay for thinking-mode models
- **MCP**: stdio server on top of `@modelcontextprotocol/sdk`
- **Export**: `docx` v9 (pure JS, no native deps)
- **Packaging**: electron-builder, NSIS + Portable twin output, ~90 s per build

### Paths

```
~/Documents/SciPaperTodo/                  # macOS / Linux
%USERPROFILE%\Documents\SciPaperTodo\      # Windows
├── database.json           # Main database (atomic writes)
├── database.json.bak       # Rolling 5-minute backup
├── Articles\
│   └── {ArticleId}\
│       ├── Attachments\    # Copied figures / raw data files
│       └── Exports\        # Generated docx / md
└── Theses\                 # Degree theses (aggregate of multiple articles)
```

### Who is this for

- Life-science PhD students, postdocs, early-career PIs (default audience)
- Any IMRaD writer juggling multiple manuscripts and review rounds
- Anyone who wants AI in their writing flow but does not want their data on a vendor's cloud

### Caveats

- macOS dmg/zip packaging is configured; public releases need Developer ID signing and notarization before Gatekeeper warnings disappear
- Legacy `deepseek-chat` / `deepseek-reasoner` model IDs are deprecated per DeepSeek docs; presets ship with `deepseek-v4-flash` / `deepseek-v4-pro`
- safeStorage refuses to persist API keys under WSL; run the actual binary on Windows for full functionality
- **Portable .exe is unstable as an MCP server target.** The Windows NSIS portable wrapper self-extracts to `%LOCALAPPDATA%\Temp\<random-hash>\`, gets cleaned up on close, and may pick a new hash on the next run. Any external MCP client config pinned to that path will fail next session. To use SciPaper Todo as an MCP server, install via Setup (stable path), or copy the Portable .exe into a fixed folder of your own and point the MCP config there.
