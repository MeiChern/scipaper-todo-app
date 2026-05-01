# 这一棒做了什么

接 1.0.12 的下一棒。先打 1.0.13（docx italicGuide 联动 + resolveBlockPath 重构 + dead test 清理），再打 1.0.14（DeepSeek Pro 预设 + 数据库原子写入 + ProviderManager 清理）。

## 1.0.14 — 预设扩展 + 数据安全 + cleanup

### E1. DeepSeek V4 Pro preset

- `electron/llmPresets.cjs` 加第二个预设条目
- `name: "DeepSeek V4 Pro"`, `defaultModel: "deepseek-v4-pro"`, `defaultMaxTokens: 384000`
- description 写明 1M 上下文 / 384K 输出 / 默认思考模式 / 折扣信息
- ProviderManager 已经 `presets.slice(0, 4)` 自动展示，UI 不动

**1.0.15 修正**：之前 1.0.14 里 maxTokens 误填 65536，查 api-docs.deepseek.com 后确认 Pro 和 Flash 一样是 384K，已改正。同时 known-bugs.md #1 也更新，把 deepseek-chat / deepseek-reasoner 与 V4 Flash 的映射写清楚。

### E2. 数据库原子写入 + 周期备份

`electron/storage.cjs` 的 `writeDatabase` 改造：

- 写到 `database.json.tmp` → `fs.renameSync` 替换原文件（POSIX 原子，Windows Node 也能 atomic replace）
- 每 5 分钟以上 cooldown 时，写前 `cp database.json → database.json.bak`（rolling 1 份历史副本）
- `readDatabase` 加恢复逻辑：主文件丢了但 .bak 还在 → 自动 promote .bak

实测：
- 三次连续 write 后 .tmp 不残留 ✓
- .bak 在第一次写后即创建 ✓
- 老的 vitest 跑过：4 fail（baseline）→ 改完 2 fail，剩两个是 writingStreak 字段语义旧 bug，与原子写无关

### E3. ProviderManager setTimeout cleanup

`src/components/ProviderManager.tsx` 改：

- 加 `testTimeouts: useRef<Map<id, handle>>`
- `useEffect` 卸载时遍历 clearTimeout
- 重命名 5s 清状态的逻辑为 `scheduleTestClear(id)`，覆盖前先 clear 旧 handle（防快速点 "测试" 残留）
- 删掉 runTest 里两处裸 setTimeout

修了 known-bugs.md #4 的 React unmount warning。

### E4. 打包 1.0.14

- `package.json` 1.0.13 → 1.0.14
- `cd /home/nee/todo && npm run dist:win` ~60-90 秒
- Setup 96.99 MB + Portable 96.76 MB 已 cp 到桌面

## 1.0.13 — next.md #2 + #7 清账

## 1.0.13 — next.md #2 + #7 清账（先做的版本）

### A1. resolveBlockPath 抽到 storage 公开接口（next.md #7）

- `electron/storage.cjs` `module.exports` 加 `resolveBlockPath`
- `electron/docxExporter.cjs` 删掉 inline `resolveBlockFilePath`，改 require storage 的 `resolveBlockPath`

副作用：storage 版本更鲁棒（处理 Windows 绝对路径回退 + `normalizeRelativeAssetPath`），Image block 路径解析行为统一了。

### A2. 删 dead test 文件

- `tests/searchEngine.test.ts` 删掉，引用的 `src/utils/searchEngine.ts` 早就被删
- `tests/storage.test.ts` 留着（vitest 还能跑）

### B1+B2. docx + italicGuide LLM 联动（next.md #2）

加了一个 toggle，导出 docx 前先调 LLM 给学名/拉丁短语/统计变量等加斜体。

**llmClient.cjs:**

- 新增 `simpleComplete({ providerId, system, userMessage, signal, maxTokens })`
- 非流式、不带 tool、temperature 0.1，直接返回字符串
- 同时支持 `openai-compat` 和 `anthropic` 协议
- providerId 不传就用 active provider
- 已 export 给其他模块复用（不只是 docx 用，未来其他一次性补全也走它）

**docxExporter.cjs:**

- 新增 `parseInlineItalic(line)`：手写 markdown inline 解析器
  - `*x*` / `_x_` → italic
  - `**bold**` 不动（保留字面量）
  - `\*` 转义 → 字面 `*`
  - 嵌套同字符 / 含换行 → 拒绝当 italic
  - 单行处理（多行在外面 split）
- 新增 `runsForLine` + 重写 `bodyParagraph`：每行拆成 TextRun 数组，italic 段单独标 `italics: true`
- 新增 `applyItalicMarks(text, guidePrompt, providerId, signal)`：
  - 调 simpleComplete，system = italicGuide.prompt + 输出指令（"仅返回标好的原文,不要解释"）
  - 长度 sanity check：返回长度比原文 < 0.4× 或 > 2.5× → 视为 LLM 漂了，回退原文
  - 任意异常 → 回退原文
- 新增 `buildItalicMarkMap(article, signal)`：并行跑所有 text block，Promise.all
- `buildDocument(article, spec, italicMap)` 多收一个 Map<blockId, markedText>，render 时优先用 marked
- `exportArticleDocx(articleId, templateId, options)` 加 `options.applyItalicGuide`

**main.cjs IPC：**

- `article:exportDocx` handler 收 `{ articleId, templateId, applyItalicGuide }`，传给 exporter

**preload.cjs：**

- `exportArticleDocx(articleId, templateId, applyItalicGuide)` 三参

**src/global.d.ts：**

- `exportArticleDocx` 签名加 `applyItalicGuide?: boolean`

**src/App.tsx：**

- 加 `docxApplyItalic` 和 `docxBusy` 两个 state
- header-actions 区域 docx 模板下拉旁边加 `<label><input type="checkbox" />套斜体规范</label>`
- 导出按钮变 async + try/finally + busy 文案 "导出中…"
- 错误弹 `alert`

**关键设计点：**

- 默认关闭（`docxApplyItalic = false`），用户主动勾才走 LLM
- 即使关闭，用户在 text block 里手打的 `*xxx*` 也会渲染成 italic（parser 一直在）—— 顺手红利
- 并行调用：一个 article 30 个 text block 同时发，墙钟接近最长那一个的 RT
- 任意 block 失败不影响其他 —— 各自的 fallback 独立

### 烟测

- `node -e require docxExporter` → TEMPLATES 3 个，exportArticleDocx 是 function
- `parseInlineItalic('See *Chilo suppressalis* (n=*p* < 0.05) and **bold** _italic_')` →
  - 物种名 → italics:true ✓
  - `*p*` → italics:true ✓
  - `**bold**` → 保留字面量 ✓
  - `_italic_` → italics:true ✓
- 转义 `\*not italic\*` → 字面 `*not italic*` ✓
- 三个模板 academic-en / thesis-zh / nature 都 export 出来 ~9KB docx
- unzip word/document.xml 验：`<w:i/>` 只在 `Chilo suppressalis` / `p` 这种 marked 词上，周围 "See ", "expression at" 全是平体 ✓

### 验证情况

- `npx tsc -b` → 零错误
- `npm run build:renderer` → 65 modules, 412.39 KB JS gzipped 126.62 KB, 93.15 KB CSS gzipped 14.76 KB
- `npm run dist:win` → Setup 96.99 MB + Portable 96.76 MB（重要：必须从 `/home/nee/todo` 跑，不然 ENOENT）
- 两个 exe 已 cp 到桌面 `SciPaperTodo-fixed-1.0.1-20260430/`

**没在 Windows 实机跑**（user-preference #14：WSL 不能跑 Electron GUI）。所以以下要用户实机验证：

1. Article 详情头部 docx 导出区：勾选 "套斜体规范" + 选模板 + 点"导出 docx"
2. 关闭 toggle 时正常导出（默认行为不变）
3. 开启 toggle 时调用 active provider 的 API（DeepSeek V4 Flash）跑 LLM
4. Settings → 拉丁斜体规范 卡片改 prompt，导出再跑应该按新 prompt 标
5. Settings → 拉丁斜体规范 卡片关闭 enabled，即使 toggle 勾上也不调 LLM（applyItalicMarks 进 buildItalicMarkMap 前先看 `guide.enabled`）

## 关键决策

- LLM call 用 simpleComplete 走 active provider，不另开 provider 配置 —— 用户已经配过了
- 长度 sanity ratio 0.4–2.5：经验值，模型加斜体星号通常增 5-15% 长度，缩短或翻倍都算异常
- 不批量发整篇文章：怕 LLM 长输出截断或漏处理。每 text block 一次调用，并行
- 默认关闭：避免用户不知情下走 LLM 烧钱
- inline parser 不支持 `**bold**`：scope creep，只做 italic 一件事
- 没动主题、ContentBlock model、Storage schema —— 完全 additive
