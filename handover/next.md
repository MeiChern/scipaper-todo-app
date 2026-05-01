# 下一棒的活儿清单

1.0.13 已 ship。next.md #2（docx + italicGuide LLM 联动）和 #7（resolveBlockPath 抽离）这次都做了。剩下都是中低优 + 用户反馈迭代。

## 高优（用户实机后可能要修）

### 1. docx 导出实机问题排查

用户实机会发现的潜在问题（按概率排序）：

- **中文学位模板字体没生效** — 检查 docx run 的 `font: { eastAsia: 'SimSun' }` 是否被 Word 正确识别，可能要补 `hint: 'eastAsia'`
- **Image 块导入失败** — `docxExporter.cjs` 里复制了 `resolveBlockPath` inline，可能跟 storage.cjs 行为不一致；如果图片导出不出来先看这个
- **References 悬挂缩进过强或弱** — 现在统一 `indent: { left: 720, hanging: 720 }`，模板特异化没做
- **段落空行没保留** — Text block 用 `\n` 拆段，多个连续空行会被 collapse；用户报"格式丢了"先看这个
- **图片 dimension 写死 400×300** — 比例失真。可改成读图实际尺寸（用 `image-size` 库或 `sharp`）

### 2. docx + italicGuide 联动 ✅ 1.0.13 已做

UI 入口在 Article 详情头部 docx 导出区：勾"套斜体规范" + 选模板 + 点"导出 docx"。
默认关闭，开启后并行调 LLM。inline parser 处理 `*x*`/`_x_`，跳 `**bold**` 字面量。

实机要试：
- 关闭 toggle → 行为同 1.0.12（应该）
- 开启 toggle 但 Settings → 拉丁规范卡片关掉 enabled → 不调 LLM
- 开启 toggle + 卡片 enabled + 调用 active provider 的 API → 跑通
- 物种名 / 拉丁短语 / *p* 这类应该被 LLM 标上，导出后 Word 打开看实际斜体

### 3. Zotero 接入实测

后端 zoteroClient + 5 个 zotero MCP tool 都在，但还没在 1.0.x 真用过：

- 用户装好 zotero-mcp-plugin 后开启 Zotero
- 进 Settings → Zotero 接入 → 启用 + 设 endpoint
- 在 AI 助手里问引用类问题，看 LLM 能不能调到 zotero search tool
- 如果连不通，先看 `electron/zoteroClient.cjs` 默认 endpoint / 检查端口 / 看请求 header

## 中优先

### 4. 海报视觉调整

handover v1 留下的。1.0.10 已迭代到 v8（claude 加 Latin 引文 + 印章；fresh 加叶子 + 波浪线 + 渐变进度条；统一 1080×1440）。如果用户跑实机后还有意见，按他点名的具体元素再调，**不要全推倒**。

### 5. scenario prompt 调优

8 个内置 scenario 是基于通用 best practice。用户研究领域是分子生物学/昆虫学（二化螟脂肪体转录组），实际跑可能要按领域调措辞。

### 6. provider 数据迁移

用户 1.0.8 / 1.0.9 数据库可能还有旧的 4 个 preset（OpenAI / Kimi / Anthropic）。让用户手动去 Settings → AI Provider 删，或写一次性 migration 清理。

### 7. resolveBlockPath 抽到 storage 公开接口 ✅ 1.0.13 已做

storage 已 export，docxExporter 已改 require。inline 副本删了。

## 低优先（handover v1 留下的）

- 应用图标（electron-builder 一直警告 default Electron icon）
- 学位论文（Thesis）详情视图（大活，1 周以上）
- 跨稿件全文搜索
- 删除 article 的 UI 按钮（目前 storage 没 `deleteArticle`，要先加）
- ~~数据库原子写入 + 自动备份~~ ✅ 1.0.14 已做（`writeDatabase` 走 .tmp + rename，每 5 分钟 cooldown 后写一份 .bak，readDatabase 自动从 .bak recover）
- ~~旧 vitest 文件 `tests/searchEngine.test.ts` 引用已删模块~~ ✅ 1.0.13 已删；`storage.test.ts` 仍在
- ~~ProviderManager 的 setTimeout 没 cleanup~~ ✅ 1.0.14 已加 useEffect cleanup
- ~~DeepSeek Pro 的 model id 经验推断~~ ✅ 1.0.15 查官方文档校对，`deepseek-v4-pro` 正确，maxTokens 也修到 384000

## 路径建议

下一棒进来先等用户给方向。如果用户没指定，按这个顺序回访：

1. 问用户 1.0.14 实机测出来怎么样（docx 套斜体规范 toggle / DeepSeek Pro 预设是否能连 / DB 是否还正常 / sidebar AI 按钮）
2. 按用户报的 bug 修（高优 #1）
3. Zotero 接入实测 + bug 修（#3）
4. 如果稳定，攻中优先（#5 scenario prompt 调优 / #6 provider 数据迁移）

打包前必跑：

```bash
cd /home/nee/todo
npx tsc -b                  # 零错误
npm run build:renderer      # 也零错误
```

打包：

```bash
# 先 bump package.json version
npm run dist:win
cp release/*-1.0.X.exe "/mnt/c/Users/自动挡赛车手/Desktop/SciPaperTodo-fixed-1.0.1-20260430/"
```
