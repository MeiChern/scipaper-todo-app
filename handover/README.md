# Handover · 1.0.15 → 1.0.16

下一棒进来先看这个文件。所有上下文按主题拆到子文件，用就翻。

## 索引

| 文件 | 内容 |
|---|---|
| `state.md` | 当前 ship 状态、项目栈/目录结构、产物路径、TS/build 命令 |
| `this-session.md` | 这一棒做了什么（仅海报重设计），每个文件改了什么、还留下哪些临时素材 |
| `next.md` | 下一棒的活儿清单：高/中/低优先级，附件已就绪情况 |
| `dispatch.md` | 子代理（codex / kimi）派单铁律 + 实测有效的 prompt 模板 |
| `user-preferences.md` | 用户已确认的偏好和忌讳，每条都来自真实交互 |
| `known-bugs.md` | 候选 bug，没复现，给下一棒留个抽时间确认的清单 |

## 启动姿势

```bash
cd /home/nee/todo
git status                                    # 看脏文件
git log --oneline -15                         # 最近 commit
ls electron/                                  # 确认 LLM/Zotero 相关 .cjs 都在
npx tsc -b                                    # 必须零错误
```

然后等用户给指示。**不要主动改代码，听用户说要改哪个再动。**

## 速读项目

- **栈**：Electron 37 + React 19 + TS 6 + Vite 8，本地优先无后端
- **数据**：JSON 文件 `~/Documents/SciPaperTodo/database.json` + safeStorage 加密 keys
- **当前版本**：1.0.15 已 ship 到 `/mnt/c/Users/自动挡赛车手/Desktop/SciPaperTodo-fixed-1.0.1-20260430/`（含 docx italicGuide 联动 + DeepSeek Flash/Pro 双预设 + DB 原子写入）
- **下一版本**：1.0.16，等用户实机反馈后修 bug + 中优先迭代
- **产品定位**：上下文中枢 — researchContext 当一等公民，贯穿写作 / 引文 / AI 协作 / 修改 / 学位论文整合
