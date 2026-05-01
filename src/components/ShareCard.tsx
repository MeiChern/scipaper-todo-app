import { useEffect, useRef, useState, useCallback, type JSX } from 'react'
import { createPortal } from 'react-dom'
import type { ProgressEntryKind } from '../types'

export interface ShareCardData {
  date: string
  todayWords: number
  addedWords: number
  removedWords: number
  changedWords: number
  byAI: number
  byManual: number
  focusMinutes: number
  streak: number
  dailyGoal: number
  analogy: string
  joke: string
  appName?: string
  entriesByKind?: { kind: ProgressEntryKind; count: number; totalMinutes?: number; items: { title: string; articleTitle?: string }[] }[]
  relatedArticleTitles?: string[]
  findingsTouched?: string[]
}

export interface ShareCardProps {
  open: boolean
  onClose: () => void
  data: ShareCardData
  theme: 'claude' | 'pixel' | 'fresh'
  onRegenerateJoke?: () => void
}

interface ThemeDef {
  bg: string
  bgGradient?: [string, string]
  ink: string
  inkSoft: string
  inkFaint: string
  rule: string
  accent: string
  accentSoft?: string
  display: string
  body: string
  italic: string
  label: string
  paperGrain: boolean
  ornament: string
  breakOrnament: string
  cornerStroke: boolean
  epigraph?: string
}

const EMOJI_FALLBACK = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", "EmojiOne Color"'
const SERIF_STACK = `"EB Garamond", "Georgia", "Songti SC", "STSong", "Source Han Serif SC", "SimSun", ${EMOJI_FALLBACK}, serif`
const SERIF_ITALIC_STACK = `"EB Garamond", "Georgia", "Songti SC", "STSong", "Source Han Serif SC", "SimSun", ${EMOJI_FALLBACK}, serif`
const SANS_STACK = `"Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", ${EMOJI_FALLBACK}, sans-serif`
const MONO_STACK = `"JetBrains Mono", "Cascadia Code", "Consolas", "Menlo", "Courier New", ${EMOJI_FALLBACK}, monospace`

const THEMES: Record<ShareCardProps['theme'], ThemeDef> = {
  claude: {
    bg: '#f1e8d6',
    bgGradient: ['#f5ecda', '#e9dcc1'],
    ink: '#2a2018',
    inkSoft: '#6b5c4d',
    inkFaint: '#a89579',
    rule: 'rgba(42, 32, 24, 0.28)',
    accent: '#a3653f',
    accentSoft: '#c89372',
    display: SERIF_STACK,
    body: SANS_STACK,
    italic: SERIF_ITALIC_STACK,
    label: SANS_STACK,
    paperGrain: true,
    ornament: '✦',
    breakOrnament: '❦',
    cornerStroke: false,
    epigraph: 'Diurna   ·   Verba Quotidiana',
  },
  pixel: {
    bg: '#fafaf7',
    ink: '#0a0a0a',
    inkSoft: '#3a3a3a',
    inkFaint: '#9a9a9a',
    rule: '#0a0a0a',
    accent: '#0a0a0a',
    display: MONO_STACK,
    body: MONO_STACK,
    italic: MONO_STACK,
    label: MONO_STACK,
    paperGrain: false,
    ornament: '──',
    breakOrnament: '─ ─ ─ ─ ─',
    cornerStroke: true,
  },
  fresh: {
    bg: '#eaf3e8',
    bgGradient: ['#f1f7ee', '#d3e6d2'],
    ink: '#1f3a2a',
    inkSoft: '#4f6b58',
    inkFaint: '#8aa394',
    rule: 'rgba(31, 58, 42, 0.22)',
    accent: '#3f8a5f',
    accentSoft: '#7fb38c',
    display: SANS_STACK,
    body: SANS_STACK,
    italic: SERIF_ITALIC_STACK,
    label: SANS_STACK,
    paperGrain: false,
    ornament: '❀',
    breakOrnament: '❀',
    cornerStroke: false,
  },
}

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatMagazineDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const year = m[1]
  const monthIdx = parseInt(m[2], 10) - 1
  const day = parseInt(m[3], 10)
  if (monthIdx < 0 || monthIdx > 11) return iso
  return `${day} ${MONTH_ABBR[monthIdx]} ${year}`
}

function setFont(ctx: CanvasRenderingContext2D, family: string, size: number, weight: string | number = 'normal', italic = false): void {
  const style = italic ? 'italic' : 'normal'
  ctx.font = `${style} ${weight} ${size}px ${family}`
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'center' | 'right',
): void {
  const chars = Array.from(text)
  const advances = chars.map((ch) => ctx.measureText(ch).width)
  const total = advances.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1)
  let cx = x
  if (align === 'center') cx = x - total / 2
  else if (align === 'right') cx = x - total
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cx, y)
    cx += advances[i] + tracking
  }
  ctx.textAlign = prevAlign
}

function drawHairline(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  color: string,
  width = 1,
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  const py = Math.round(y) + (width % 2 === 1 ? 0.5 : 0)
  ctx.moveTo(x1, py)
  ctx.lineTo(x2, py)
  ctx.stroke()
  ctx.restore()
}

function drawVerticalRule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  color: string,
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  const px = Math.round(x) + 0.5
  ctx.moveTo(px, y1)
  ctx.lineTo(px, y2)
  ctx.stroke()
  ctx.restore()
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  ratio: number,
  bgColor: string,
  fillColor: string | CanvasGradient,
  height = 3,
  square = false,
): void {
  const r = square ? 0 : height / 2
  const clamped = Math.min(Math.max(ratio, 0), 1)
  ctx.save()
  ctx.fillStyle = bgColor
  if (r > 0 && 'roundRect' in ctx) {
    ctx.beginPath()
    ;(ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(x, y, w, height, r)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, w, height)
  }
  if (clamped > 0) {
    ctx.fillStyle = fillColor
    const fw = w * clamped
    if (r > 0 && 'roundRect' in ctx) {
      ctx.beginPath()
      ;(ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(x, y, fw, height, r)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, fw, height)
    }
  }
  ctx.restore()
}

function drawFreshLeaves(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(20, -22, 56, -42, 80, -50)
  ctx.bezierCurveTo(60, -18, 32, -2, 0, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(18, 12)
  ctx.bezierCurveTo(40, 0, 78, -12, 102, -8)
  ctx.bezierCurveTo(76, 12, 44, 28, 18, 12)
  ctx.fill()
  ctx.globalAlpha = 0.85
  ctx.strokeStyle = color
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(-8, 8)
  ctx.bezierCurveTo(8, -2, 30, -8, 70, -36)
  ctx.stroke()
  ctx.restore()
}

function drawFreshWave(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: string, amp = 4): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = x1; x <= x2; x += 3) {
    const yy = y + Math.sin((x - x1) * 0.045) * amp
    if (x === x1) ctx.moveTo(x, yy)
    else ctx.lineTo(x, yy)
  }
  ctx.stroke()
  ctx.restore()
}

function drawClaudeStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, fontFamily: string, text: string): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `500 14px ${fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const chars = Array.from(text)
  const tracking = 3
  const advances = chars.map((ch) => ctx.measureText(ch).width)
  const totalText = advances.reduce((s, w2) => s + w2, 0) + tracking * Math.max(0, chars.length - 1)
  const sidePad = 24
  const w = Math.max(240, Math.ceil(totalText) + sidePad * 2)
  const h = 44
  const x = cx - w / 2
  const y = cy - h / 2

  ctx.strokeStyle = color
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8)
  ctx.globalAlpha = 1

  let lx = cx - totalText / 2
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], lx, cy + 1)
    lx += advances[i] + tracking
  }
  ctx.restore()
}

function drawPaperGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (Math.random() > 0.86) {
      const noise = (Math.random() - 0.5) * 22
      d[i] = Math.max(0, Math.min(255, d[i] + noise))
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise))
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise))
    }
  }
  ctx.putImageData(img, 0, 0)
}

const HANGING_PUNCT = new Set([
  '。', '，', '、', '；', '：', '！', '？', '」', '』', '】', '）', '｝', '．',
  '.', ',', '!', '?', ';', ':', ')', ']', '}',
])

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  yTop: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const chars = Array.from(text)
  const lines: string[] = []
  let line = ''
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      if (HANGING_PUNCT.has(ch)) {
        line = test
      } else {
        lines.push(line)
        line = ch
        if (lines.length === maxLines) break
      }
    } else {
      line = test
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  const trimmed = lines.slice(0, maxLines)
  let cy = yTop
  for (const ln of trimmed) {
    ctx.fillText(ln, cx, cy)
    cy += lineHeight
  }
  return cy
}

const ENTRY_KIND_ORDER: ProgressEntryKind[] = ['read', 'experiment', 'writing', 'analysis', 'idea', 'cite', 'focus', 'mood']
const ENTRY_KIND_LABELS: Record<ProgressEntryKind, string> = {
  read: '读',
  experiment: '实验',
  writing: '写',
  analysis: '析',
  idea: '想',
  cite: '引',
  focus: '专注',
  mood: '心情',
}
const ENTRY_KIND_COLORS: Partial<Record<ProgressEntryKind, string>> = {
  focus: '#5b8a72',
  mood: '#c89372',
}
const ENTRY_KIND_UNITS: Record<ProgressEntryKind, string> = {
  read: '篇',
  experiment: '组',
  writing: '字',
  analysis: '项',
  idea: '个',
  cite: '条',
  focus: 'min',
  mood: '条',
}

interface ProgressPosterRow {
  kind: ProgressEntryKind
  count: number
  text: string
  color?: string
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  const ellipsis = '...'
  let trimmed = text
  while (trimmed.length > 0 && ctx.measureText(`${trimmed}${ellipsis}`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed}${ellipsis}`
}

function formatPosterNumber(value: number): string {
  return Math.max(0, value).toLocaleString('en-US')
}

function buildProgressRows(data: ShareCardData): { rows: ProgressPosterRow[]; total: number } {
  if (!data.entriesByKind?.length) {
    return { rows: [], total: 0 }
  }

  const groups = new Map<ProgressEntryKind, { count: number; totalMinutes?: number; items: { title: string; articleTitle?: string }[] }>()
  for (const group of data.entriesByKind) {
    groups.set(group.kind, group)
  }

  const rows: ProgressPosterRow[] = []
  for (const kind of ENTRY_KIND_ORDER) {
    const group = groups.get(kind)
    if (!group) continue

    const count = kind === 'writing' ? Math.max(0, data.todayWords) : Math.max(0, group.count)
    if (count === 0) continue

    const label = ENTRY_KIND_LABELS[kind]
    const unit = ENTRY_KIND_UNITS[kind]

    if (kind === 'focus') {
      const totalMinutes = Math.max(0, Math.round(group.totalMinutes ?? count * 25))
      rows.push({
        kind,
        count,
        text: `${label} · ${formatPosterNumber(count)} 段 · ${formatPosterNumber(totalMinutes)}min`,
        color: ENTRY_KIND_COLORS[kind],
      })
      continue
    }

    rows.push({
      kind,
      count,
      text: `${label} · ${formatPosterNumber(count)} ${unit}`,
      color: ENTRY_KIND_COLORS[kind],
    })
  }

  return {
    rows,
    // writing 的 count 是字数，不能直接加进"项进展"。有字数算 1 项。
    total: rows.reduce((sum, row) => {
      if (row.kind === 'writing') return sum + (row.count > 0 ? 1 : 0)
      return sum + row.count
    }, 0),
  }
}

function drawPoster(canvas: HTMLCanvasElement, data: ShareCardData, themeKey: ShareCardProps['theme']): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const t = THEMES[themeKey]
  const W = 1080
  const H = 1440
  const M = 84
  const appName = data.appName || 'SciPaper Todo'
  const progress = buildProgressRows(data)
  // 只要 entriesByKind 字段存在（即新版数据），就始终走"项进展"版式；
  // 0 项时下方 list 会画空状态行，避免回退到老版"0 字"hero。
  const hasProgressRows = data.entriesByKind !== undefined

  ctx.clearRect(0, 0, W, H)

  if (t.bgGradient) {
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, t.bgGradient[0])
    grad.addColorStop(1, t.bgGradient[1])
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = t.bg
  }
  ctx.fillRect(0, 0, W, H)

  if (t.paperGrain) drawPaperGrain(ctx, W, H)

  if (t.cornerStroke) {
    ctx.strokeStyle = t.ink
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, W - 56, H - 56)
  }

  if (themeKey === 'fresh' && t.accentSoft) {
    drawFreshLeaves(ctx, W - 230, 96, t.accent)
  }

  ctx.textBaseline = 'alphabetic'

  // ── Top bar ────────────────────────────────────────
  setFont(ctx, t.label, 19, 500)
  ctx.fillStyle = t.inkSoft
  ctx.textAlign = 'left'
  drawTracked(ctx, appName.toUpperCase(), M, 130, 4.6, 'left')
  ctx.textAlign = 'right'
  drawTracked(ctx, `${formatMagazineDate(data.date)}  ·  NO.${String(Math.max(0, data.streak)).padStart(2, '0')}`, W - M, 130, 4.6, 'right')

  drawHairline(ctx, M, W - M, 162, t.rule, 1)

  // ── Latin epigraph (claude only) ───────────────────
  if (themeKey === 'claude' && t.epigraph) {
    setFont(ctx, t.italic, 22, 400, true)
    ctx.fillStyle = t.inkFaint
    ctx.textAlign = 'center'
    ctx.fillText(t.epigraph, W / 2, 206)
  }

  // ── Section label ──────────────────────────────────
  ctx.fillStyle = t.inkFaint
  setFont(ctx, t.label, 22, 500)
  drawTracked(ctx, hasProgressRows ? 'TODAY   ·   今 日 进 展' : 'TODAY   ·   今 日 净 增', W / 2, 290, 8, 'center')

  if (themeKey === 'claude') {
    setFont(ctx, t.display, 22)
    ctx.fillStyle = t.inkFaint
    ctx.textAlign = 'center'
    ctx.fillText('❦', W / 2 - 230, 291)
    ctx.fillText('❦', W / 2 + 230, 291)
  }

  if (hasProgressRows) {
    // ── Progress headline ────────────────────────────
    const headline = `今日 · ${formatPosterNumber(progress.total)} 项进展`
    setFont(ctx, t.display, themeKey === 'pixel' ? 68 : 76, 600)
    ctx.fillStyle = t.ink
    ctx.textAlign = 'center'
    wrapCenteredText(ctx, headline, W / 2, 440, W - 2 * M, themeKey === 'pixel' ? 84 : 90, 1)

    const listTop = 620
    const isEmpty = progress.rows.length === 0
    const rowGap = isEmpty ? 0 : (progress.rows.length > 6 ? 58 : progress.rows.length > 4 ? 70 : 82)
    drawHairline(ctx, M + 44, W - M - 44, listTop - 46, t.rule, 1)
    drawHairline(ctx, M + 44, W - M - 44, listTop + rowGap * Math.max(1, progress.rows.length) - 28, t.rule, 1)

    setFont(ctx, t.body, themeKey === 'pixel' ? 26 : 29, themeKey === 'pixel' ? 500 : 400)
    ctx.textAlign = 'center'

    if (isEmpty) {
      // Empty state — 0 项进展的兜底
      setFont(ctx, t.italic, themeKey === 'pixel' ? 24 : 26, 400, true)
      ctx.fillStyle = t.inkSoft
      wrapCenteredText(
        ctx,
        '今天还没记。先去写一段、记一笔，或者跑完一段番茄钟。',
        W / 2,
        listTop + 20,
        W - 2 * M - 60,
        38,
        2,
      )
    } else {
      for (let i = 0; i < progress.rows.length; i++) {
        const row = progress.rows[i]
        const y = listTop + i * rowGap
        ctx.fillStyle = row.color ?? (row.kind === 'writing' ? t.accent : t.ink)
        ctx.fillText(truncateToWidth(ctx, row.text, W - 2 * M - 54), W / 2, y)
        if (i < progress.rows.length - 1) {
          drawHairline(ctx, M + 150, W - M - 150, y + 30, t.rule, 1)
        }
      }
    }

    const footerY = 1104
    const footer = `连续 ${data.streak} 天 · 专注 ${data.focusMinutes} 分钟 · ${data.analogy}`
    setFont(ctx, t.italic, 27, 400, true)
    ctx.fillStyle = t.inkSoft
    wrapCenteredText(ctx, footer, W / 2, footerY, W - 2 * M - 34, 40, 2)

    setFont(ctx, t.italic, 24, 400, true)
    ctx.fillStyle = t.inkSoft
    wrapCenteredText(ctx, `「${data.joke}」`, W / 2, 1216, W - 2 * M - 60, 34, 2)

    const breakY = 1292
    ctx.fillStyle = t.inkFaint
    ctx.textAlign = 'center'
    if (themeKey === 'pixel') {
      setFont(ctx, t.label, 16, 500)
      drawTracked(ctx, t.breakOrnament, W / 2, breakY, 4, 'center')
    } else {
      drawHairline(ctx, W / 2 - 100, W / 2 - 28, breakY - 7, t.rule, 1)
      setFont(ctx, t.display, themeKey === 'fresh' ? 24 : 22)
      ctx.fillStyle = themeKey === 'fresh' ? t.accent : t.inkFaint
      ctx.fillText(t.breakOrnament, W / 2, breakY)
      drawHairline(ctx, W / 2 + 28, W / 2 + 100, breakY - 7, t.rule, 1)
    }

    if (themeKey === 'claude') {
      const issueText = `VOL. ${data.date.slice(0, 4)}   ·   ISSUE NO. ${String(Math.max(0, data.streak)).padStart(2, '0')}`
      drawClaudeStamp(ctx, W / 2, 1352, t.inkFaint, t.label, issueText)
    } else {
      setFont(ctx, t.label, 15, 500)
      ctx.fillStyle = t.inkFaint
      drawTracked(ctx, `${t.ornament}   ${appName.toUpperCase()}   ${t.ornament}`, W / 2, 1356, 4.6, 'center')
    }

    if (themeKey === 'fresh') {
      drawFreshWave(ctx, M + 40, W - M - 40, 1330, t.accent)
    }

    return
  }

  // ── Hero number ───────────────────────────────────
  const numStr = data.todayWords.toLocaleString('en-US')
  setFont(ctx, t.display, 250, 600)
  ctx.fillStyle = t.ink
  ctx.letterSpacing = '-2.5px'
  const numWidth = ctx.measureText(numStr).width
  ctx.letterSpacing = '0px'
  setFont(ctx, t.display, 64, 400)
  const unitGap = 22
  const unitWidth = ctx.measureText('字').width
  const groupW = numWidth + unitGap + unitWidth
  const groupX = (W - groupW) / 2
  const numBaseline = 522
  ctx.textAlign = 'left'
  setFont(ctx, t.display, 250, 600)
  ctx.letterSpacing = '-2.5px'
  ctx.fillStyle = t.ink
  ctx.fillText(numStr, groupX, numBaseline)
  ctx.letterSpacing = '0px'
  setFont(ctx, t.display, 64, 400)
  ctx.fillStyle = t.inkSoft
  ctx.fillText('字', groupX + numWidth + unitGap, numBaseline)

  // ── Sub-line: target ──────────────────────────────
  setFont(ctx, t.italic, 30, 400, true)
  ctx.fillStyle = t.inkSoft
  ctx.textAlign = 'center'
  ctx.fillText(`/ 目标 ${data.dailyGoal.toLocaleString('en-US')} 字`, W / 2, 596)

  // ── Progress bar ──────────────────────────────────
  const barW = 660
  const barX = (W - barW) / 2
  const ratio = data.dailyGoal > 0 ? data.todayWords / data.dailyGoal : 0
  let fillStyleProgress: string | CanvasGradient = t.accent
  if (themeKey === 'fresh' && t.accentSoft) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    grad.addColorStop(0, t.accentSoft)
    grad.addColorStop(1, t.accent)
    fillStyleProgress = grad
  }
  drawProgressBar(
    ctx,
    barX,
    660,
    barW,
    ratio,
    themeKey === 'pixel' ? '#e6e6e6' : 'rgba(0,0,0,0.06)',
    fillStyleProgress,
    themeKey === 'pixel' ? 7 : 6,
    themeKey === 'pixel',
  )

  setFont(ctx, t.label, 16, 500)
  ctx.fillStyle = t.inkFaint
  const pct = `${Math.round(Math.min(Math.max(ratio, 0), 9.99) * 100)}% COMPLETE`
  drawTracked(ctx, pct, W / 2, 712, 3.6, 'center')

  // ── Three column stats with vertical hairlines ────
  const col1x = 240
  const col2x = 540
  const col3x = 840
  const ruleY1 = 798
  const ruleY2 = 950
  drawVerticalRule(ctx, 390, ruleY1, ruleY2, t.rule)
  drawVerticalRule(ctx, 690, ruleY1, ruleY2, t.rule)

  setFont(ctx, t.label, 18, 500)
  ctx.fillStyle = t.inkFaint
  drawTracked(ctx, 'ADDED', col1x, 832, 4, 'center')
  drawTracked(ctx, 'REMOVED', col2x, 832, 4, 'center')
  drawTracked(ctx, 'EDITS', col3x, 832, 4, 'center')

  setFont(ctx, t.display, 60, 500)
  ctx.fillStyle = t.ink
  ctx.textAlign = 'center'
  ctx.fillText(`+${data.addedWords.toLocaleString('en-US')}`, col1x, 916)
  ctx.fillText(`−${data.removedWords.toLocaleString('en-US')}`, col2x, 916)
  ctx.fillText(`Σ ${data.changedWords.toLocaleString('en-US')}`, col3x, 916)

  // ── Meta line ─────────────────────────────────────
  drawHairline(ctx, M + 100, W - M - 100, 1004, t.rule, 1)

  setFont(ctx, t.italic, 26, 400, true)
  ctx.fillStyle = t.inkSoft
  ctx.textAlign = 'center'
  const focusLabel = data.focusMinutes >= 60
    ? `${(data.focusMinutes / 60).toFixed(1)} h`
    : `${data.focusMinutes} min`
  const meta = `AI 协作 ${data.byAI.toLocaleString('en-US')}  ·  独立 ${data.byManual.toLocaleString('en-US')}  ·  专注 ${focusLabel}  ·  连续 ${data.streak} 天`
  ctx.fillText(meta, W / 2, 1056)

  // ── Voice: analogy ────────────────────────────────
  setFont(ctx, t.italic, 34, 400, true)
  ctx.fillStyle = t.ink
  wrapCenteredText(ctx, data.analogy, W / 2, 1146, W - 2 * M - 40, 50, 2)

  // ── Decorative break ──────────────────────────────
  const breakY = 1262
  ctx.fillStyle = t.inkFaint
  ctx.textAlign = 'center'
  if (themeKey === 'pixel') {
    setFont(ctx, t.label, 16, 500)
    drawTracked(ctx, t.breakOrnament, W / 2, breakY, 4, 'center')
  } else {
    drawHairline(ctx, W / 2 - 100, W / 2 - 28, breakY - 7, t.rule, 1)
    setFont(ctx, t.display, themeKey === 'fresh' ? 24 : 22)
    ctx.fillStyle = themeKey === 'fresh' ? t.accent : t.inkFaint
    ctx.fillText(t.breakOrnament, W / 2, breakY)
    drawHairline(ctx, W / 2 + 28, W / 2 + 100, breakY - 7, t.rule, 1)
  }

  // ── Joke ──────────────────────────────────────────
  setFont(ctx, t.italic, 26, 400, true)
  ctx.fillStyle = t.inkSoft
  wrapCenteredText(ctx, `「${data.joke}」`, W / 2, 1296, W - 2 * M - 60, 38, 1)

  // ── Bottom signature ─────────────────────────────
  if (themeKey === 'claude') {
    const issueText = `VOL. ${data.date.slice(0, 4)}   ·   ISSUE NO. ${String(Math.max(0, data.streak)).padStart(2, '0')}`
    drawClaudeStamp(ctx, W / 2, 1352, t.inkFaint, t.label, issueText)
  } else {
    setFont(ctx, t.label, 15, 500)
    ctx.fillStyle = t.inkFaint
    drawTracked(ctx, `${t.ornament}   ${appName.toUpperCase()}   ${t.ornament}`, W / 2, 1356, 4.6, 'center')
  }

  if (themeKey === 'fresh') {
    drawFreshWave(ctx, M + 40, W - M - 40, 1330, t.accent)
  }
}

export function ShareCard(props: ShareCardProps): JSX.Element | null {
  const { open, onClose, data, theme, onRegenerateJoke } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !canvasRef.current) return
    drawPoster(canvasRef.current, data, theme)
  }, [open, data, theme])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 2000)
    return () => clearTimeout(timer)
  }, [notice])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scipaper-${data.date}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [data.date])

  const handleCopy = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setNotice('已复制到剪贴板')
      } catch {
        setNotice('当前系统不支持复制图片，请使用下载')
      }
    }, 'image/png')
  }, [])

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-dialog" style={{ width: 'fit-content', maxWidth: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title">今日海报</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="关闭">✕</button>
        </div>
        <div className="modal-body" style={{ alignItems: 'center', justifyContent: 'center', overflow: 'visible', padding: '20px' }}>
          <canvas ref={canvasRef} width={1080} height={1440} style={{ display: 'block', maxHeight: 'min(74vh, 1100px)', maxWidth: 'min(560px, 86vw)', width: 'auto', height: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }} />
          {notice && <div style={{ marginTop: 8, fontSize: 14, color: 'var(--c-ink-muted)' }}>{notice}</div>}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <button className="ghost-button" onClick={onRegenerateJoke} disabled={!onRegenerateJoke} type="button">换一句俏皮话</button>
          <button className="primary-button" onClick={handleDownload} type="button">下载 PNG</button>
          <button className="ghost-button" onClick={handleCopy} type="button">复制图片</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
