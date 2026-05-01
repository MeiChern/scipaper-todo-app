# 用户偏好（必读）

每条都来自真实交互，**违反任何一条会被用户当场指出**。

## 沟通

1. **直接表达** — 不要 AI 套路口癖：
   - 不用 "不是 X 是 Y"
   - 不用 "稳稳接住"
   - 不用 表演式铺垫
   - 不用 括号动作 + 省略号
   - 中文对话同样要朴素
2. **报告完成前自己跑一遍验证** — 不能只看 TS 通过就说完事
   - 改了 UI 要起 vite + 截图看
   - 改了 IPC 要跑 IPC handler
   - 改了 canvas/绘图要 headless screenshot 看
3. **多 Phase 项目一口气推完，不每阶段确认** — 已经写好 plan.md 的就直接干

## 文件输出

4. **输出到 Windows 桌面**：`/mnt/c/Users/自动挡赛车手/Desktop/`
   - **不要**用 WSL 路径让用户去找
   - **不要**写到 `/tmp` 或仓库内的临时位置（除非主动清理）
5. 路径里有中文（`自动挡赛车手`），用 `cmd.exe` 转换 codepage 会乱码 — 直接用 bash 操作 `/mnt/c/...`

## 写作风格（如果你要写英文文档）

6. **American English academic** — 用 American spelling
7. **不用 em-dashes** — 用 commas、parens、或拆句
8. **句式多变，少用 We 开头** — 强动词，少弱动词

## 图表

9. **最少元素最多信息** — 不要装饰性元素
10. **数据来源 + 方法到 caption，不到图**
11. **显著性必须标** — 图上要有 `*` `**` `***` 或具体 p 值

## 工程

12. **不无确认装运行时依赖** — `docx` 包就是因为这个被推迟到 1.0.11
13. **不在 article-content tab 加全局工具** — 之前掉过 16 元烂摊子的坑
14. **不假设 WSL 能跑 Electron GUI** — 视觉验证用 vite + Chromium screenshot，IPC 验证靠 Windows 实机跑

## 用户身份

15. 分子生物学博士生，二化螟（Chilo suppressalis）脂肪体转录组课题，时点 L3–L6 + PP + MPD1 + FPD1
16. 写作风格懂行 — 你说的术语他都懂，不需要解释概念，直接用
