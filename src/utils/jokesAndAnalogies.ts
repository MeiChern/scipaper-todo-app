// 海报俏皮话 + 字数类比表
// 俏皮话内置 60+ 条,按场景分类。海报随机抽取,也可调 LLM 重新生成。
// 类比表:把"今日字数"换算成现实物的可感知数量,海报上显示。

export interface JokeContext {
  netWords: number
  changedWords: number
  focusMinutes: number
  streak: number
  goalMet: boolean
}

const JOKES_GOAL_MET = [
  '今天的你领先了 95% 的拖延者。',
  '导师睡着的时候,你赢了。',
  '把 deadline 揍了一拳的感觉,只有今天的你懂。',
  '光合作用看了都想给你点赞。',
  '今晚可以心安理得地刷视频了 (但你不会)。',
  '有人在卷,有人在躺,你在产出。',
  '从今天开始,你欠未来的你少了一点。',
  '完成度比你想象中重要,你今天证明了。',
]

const JOKES_GOAL_MISS = [
  '白纸还在等你解释为什么。',
  '今天的字,被你删得很有性格。',
  '不是没写,是写了又删了一遍灵魂。',
  '空白章节也是一种存在主义表达 (?)',
  '没关系,昨天和明天都信任你。',
  '今天的进度条只是含蓄。',
  '光标闪了一万次,你只动了 100 字。它问你怎么了。',
]

const JOKES_HEAVY_REWRITE = [
  '你删的字比某些人写的还多。',
  '改写就是写两遍,你今天工作量翻倍。',
  '一个段落写五遍,这才叫认真。',
  '今天的删除键被你磨损了一格。',
  '净增没多,但你内心的 Discussion 翻了三轮。',
]

const JOKES_HIGH_FOCUS = [
  '你在 deep work 里待得比鱼回家还久。',
  '专注超过 4 小时:导师都不忍心打扰你 (但他还是会)。',
  '咖啡因都跟不上你的专注。',
  '今天的你是行走的番茄钟。',
]

const JOKES_HIGH_VOLUME = [
  '这一万字够买一杯不加糖的研究品味。',
  '你今天写的字够铺满一只仓鼠跑步机的内壁。',
  'reviewer 看到这个字数会沉思十分钟。',
  '导师群里你发个截图,直接安静。',
]

const JOKES_LONG_STREAK = [
  '连续 7 天写作,你已经离一个 PhD 更近一些。',
  '坚持不是天赋,是肌肉记忆。',
  '今天是连续的第 N 天,Latex 的 git log 都开始夸你了。',
  '你的写作习惯比你的发际线还稳定。',
]

const JOKES_SHORT_BURST = [
  '短而精,这是真本事。',
  '300 字也能砸中 reviewer 的心,前提是你写得对。',
  '不在数量,在杀伤力。',
]

const JOKES_GENERIC = [
  '研究是从一个 deadline 跑到下一个 deadline。',
  'Methods 比想象中难写,Discussion 比想象中难写,Abstract 也是。',
  '把 placeholder 都填上,这才是科研。',
  '论文写到一半,你想起忘了写 Conclusion (但下意识说"再喝一口咖啡")。',
  'Paper 还没投,但今天的你已经赢了一段对话。',
  '一个想法,十次推翻,一次成稿。',
  '别人的 Introduction 看着行云流水,你的看着行云沉重。但都是合格。',
  '今天写得不如昨天?那就比昨天的你更耐心一点。',
]

export function pickJoke(context: JokeContext): string {
  const pools: string[][] = []
  if (context.goalMet) pools.push(JOKES_GOAL_MET)
  else pools.push(JOKES_GOAL_MISS)
  if (context.changedWords - Math.max(context.netWords, 0) > 500) pools.push(JOKES_HEAVY_REWRITE)
  if (context.focusMinutes >= 240) pools.push(JOKES_HIGH_FOCUS)
  if (context.netWords >= 5000) pools.push(JOKES_HIGH_VOLUME)
  if (context.streak >= 7) pools.push(JOKES_LONG_STREAK)
  if (context.netWords > 0 && context.netWords < 500) pools.push(JOKES_SHORT_BURST)
  pools.push(JOKES_GENERIC)

  const pool = pools[Math.floor(Math.random() * pools.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

// 字数类比表。输入字数 → 选最贴近的一条
const ANALOGIES: { threshold: number; render: (w: number) => string }[] = [
  { threshold: 0, render: () => '相当于一条认真的微博。' },
  { threshold: 200, render: (w) => `相当于 ${(w / 140).toFixed(1)} 条朋友圈长文。` },
  { threshold: 500, render: (w) => `相当于 ${Math.round(w / 250)} 条 reviewer comment 的总长。` },
  { threshold: 1500, render: (w) => `相当于 ${(w / 1500).toFixed(1)} 篇 short letter。` },
  { threshold: 4000, render: (w) => `相当于 ${(w / 4000).toFixed(1)} 篇 research article 的 Methods 章节。` },
  { threshold: 8000, render: (w) => `相当于一篇普通 research article 的 ${Math.round((w / 8000) * 100)}%。` },
  { threshold: 20000, render: (w) => `相当于一篇博士学位论文章节的 ${Math.round((w / 20000) * 100)}%。` },
  { threshold: 50000, render: (w) => `相当于 ${(w / 50000).toFixed(2)} 部短篇小说。` },
  { threshold: 100000, render: (w) => `相当于 ${(w / 100000).toFixed(2)} 篇 PhD 学位论文。` },
]

export function pickAnalogy(netWords: number): string {
  const w = Math.max(0, netWords)
  let chosen = ANALOGIES[0]
  for (const a of ANALOGIES) {
    if (w >= a.threshold) chosen = a
  }
  return chosen.render(w)
}

// 今天开干 — 按钮文案池
export const KICKOFF_BUTTON_LINES: string[] = [
  '今天开干',
  '开始战斗',
  '坐下，写吧',
  '启动今日模式',
  '开写',
  '干活了',
  '打开编辑器',
  '开始产出',
  '今日份码字',
  '动笔',
  '写就完了',
  '开整',
  '进入战斗',
  '干正事',
]

// 今天开干 — plan 输入框 placeholder 池
export const KICKOFF_PLACEHOLDERS: string[] = [
  '不要计划，直接开干！',
  'Plan? Just write.',
  '计划越完美，开干越遥远。',
  '写什么不重要，先让光标动起来。',
  '你的大脑在骗你，说"还没准备好"。',
  '先写垃圾，再改垃圾，最后删垃圾。这就是科研。',
  '今天不产出，明天的你只会更焦虑。',
  '坐下。打字。别多想。',
  '所有伟大的论文都始于一段惨不忍睹的初稿。',
  '别等灵感，灵感在等你的键盘。',
  '你可以后悔，但不能空白。',
  '写着写着，思路就来了——不是反过来。',
  '方法论第一条：先打开编辑器。',
  '计划五分钟，执行五小时？不，反过来。',
  '写得烂没关系，空白才丢人。',
  '你的 cursor 已经闪了十分钟了，它在嘲笑你。',
  '今天不写，明天就要补两天。',
  '假装自己是个无情的打字机器。',
  '论文不会自己从脑子里长出来。',
  '最好的 plan 就是现在写第一句话。',
  '别查文献了，先写，缺了再补。',
  '拖延的成本比写错高得多。',
  '打开文档，就是胜利的一半。',
  '写不出来？那就把脑子里想的废话打出来。',
  'deadline 不会因为你没准备好而迟到。',
  '先完成，再完美。这是命令。',
  '你还没写够垃圾，就想出金子？',
  '犹豫是今天的敌人，乱写是朋友。',
]

export function pickKickoffPlaceholder(): string {
  return KICKOFF_PLACEHOLDERS[Math.floor(Math.random() * KICKOFF_PLACEHOLDERS.length)]
}

export function pickKickoffButtonLine(): string {
  return KICKOFF_BUTTON_LINES[Math.floor(Math.random() * KICKOFF_BUTTON_LINES.length)]
}
