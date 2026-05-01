# 已知 bug 候选

**没复现**，留给下一棒抽时间确认。如果用户报告其中之一，先来这里看。

## 1. DeepSeek 模型映射（1.0.14 起两个预设：Flash + Pro）

官方文档（2026-04 查证）：

- `deepseek-v4-flash` 和 `deepseek-v4-pro` 是当前两个 V4 model id，1M 上下文 / 384K 输出上限，都默认 thinking 模式（也支持 non-thinking）
- `deepseek-chat` ≡ `deepseek-v4-flash` 的 non-thinking 模式（legacy）
- `deepseek-reasoner` ≡ `deepseek-v4-flash` 的 thinking 模式（legacy）
- legacy 名字"未来会 deprecated"

如果用户在 1.0.14 报 `model not found`，可能是账号还没开通 V4，让他手动把 model 字段改成 `deepseek-chat`（应该还能用一段时间）。

## 2. WSL 下 safeStorage 不可用

Windows 实机用 DPAPI 应该 OK，但 WSL dev 环境拒绝保存 key。已设计回退：只在用户首次警告。如果用户报"key 保存不上"，先确认是不是 WSL 跑的。

## 3. 海报 PNG 复制剪贴板

需要 `navigator.clipboard.write` + `ClipboardItem`。Electron 37 应该支持，但如果失败 fallback 到下载 PNG（已实现）。如果用户报"复制按钮不工作"，看 `ShareCard.tsx` 的 `handleCopy`。

## 4. ProviderManager setTimeout 没 cleanup

`5s` 后清状态的 `setTimeout`，组件卸载时不清。React warning，**无功能影响**。要修就在 `useEffect` 返回 `clearTimeout`。

## 5. tests/searchEngine.test.ts 引用已删文件

`vitest` 跑会报错，**不影响 build**。要修就 `rm tests/searchEngine.test.ts`。

## 6. mcp-server.cjs 的 jsonSchemaToZod

自己写的最小转换器。某些复杂 schema 可能 cover 不全，如果 MCP 客户端报错先看这里。常见的 cover 不到的：

- `oneOf` / `allOf`
- 嵌套 `anyOf`
- `$ref`

## 7. ShareCard canvas letterSpacing

代码用 `ctx.letterSpacing = '-2.5px'` 是 Canvas 2D Level 2 API（Chromium 99+）。Electron 37 是 Chromium 130+ 应该没事。如果在某个版本上字号渲染怪怪的，先看这个。

## 8. 字体回退

ShareCard 的字体栈包含 EB Garamond、Inter、JetBrains Mono — 用户 Windows 上不一定都有，会回退到系统字体（Georgia、Microsoft YaHei、Cascadia Code）。回退后字距和粗细可能略有差异。如果用户报"海报和你给的样图不一样"，先确认他的系统装了哪些字体。
