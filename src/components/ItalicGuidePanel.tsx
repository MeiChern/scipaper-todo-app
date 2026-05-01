import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { ItalicGuide } from '../types'

interface Props {
  config: ItalicGuide
  onUpdate: (next: ItalicGuide) => Promise<void>
}

const DEFAULT_PROMPT =
  '在生成或修改科研写作正文时,自动按学术英语惯例对以下内容标注斜体(用 markdown *text*):' +
  '\n- 物种学名(属种二项式,如 *Chilo suppressalis*),属名首字母大写,种名小写' +
  '\n- 拉丁短语(in vitro / in vivo / ex vivo / de novo / et al. / vs. / e.g. / i.e. / per se / via)' +
  '\n- 统计变量符号(p, t, F, r, n, N, df, χ²),例如 *p* < 0.05' +
  '\n- 基因符号(按物种约定:果蝇基因斜体小写如 *hsp70*;蛋白正体大写如 HSP70)' +
  '\n- 数学常量符号(*e* 自然常数,*i* 虚数,*x* 自变量等)' +
  '\n规则不必穷举,你应当依据学术英语规范主动识别并标注。中文写作中,这些专有术语在中文里也保持斜体英文形式(中文不变)。'

export function ItalicGuidePanel(props: Props): JSX.Element {
  const { config, onUpdate } = props
  const [prompt, setPrompt] = useState(config.prompt)
  const [enabled, setEnabled] = useState(config.enabled)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setPrompt(config.prompt)
    setEnabled(config.enabled)
  }, [config.prompt, config.enabled])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const dirty = prompt !== config.prompt || enabled !== config.enabled
  const showSaved = savedAt !== null

  async function save() {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate({ prompt, enabled })
      setSavedAt(Date.now())
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setSavedAt(null), 2500)
    } finally {
      setSaving(false)
    }
  }

  function resetToDefault() {
    setPrompt(DEFAULT_PROMPT)
    setEnabled(true)
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Italic Guide</p>
          <h3>拉丁斜体规范</h3>
          <p className="muted-text" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>
            启用后,LLM 在生成或润色正文时会按下方 prompt 自动标注物种名、拉丁短语、统计符号等斜体。
            可按需追加病毒名、菌株号、酶活单位等领域规则。
          </p>
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-1)',
            cursor: 'pointer',
            fontSize: 'var(--fs-xs)',
            color: 'var(--c-ink-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span>启用</span>
        </label>
      </div>

      <label className="field" style={{ marginTop: 'var(--sp-3)' }}>
        <span>Prompt</span>
        <textarea
          rows={14}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="向 LLM 描述哪些内容需要斜体..."
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', lineHeight: 1.55 }}
        />
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          marginTop: 'var(--sp-3)',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="primary-button"
          type="button"
          onClick={save}
          disabled={!dirty || saving}
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button className="ghost-button" type="button" onClick={resetToDefault} disabled={saving}>
          恢复默认
        </button>
        {showSaved && (
          <span className="muted-text" style={{ fontSize: 'var(--fs-xs)' }}>
            已保存
          </span>
        )}
        {dirty && !showSaved && (
          <span className="muted-text" style={{ fontSize: 'var(--fs-xs)' }}>
            未保存
          </span>
        )}
      </div>
    </section>
  )
}
