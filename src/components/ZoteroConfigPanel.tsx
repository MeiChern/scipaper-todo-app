import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import type { ZoteroConfig } from '../types'

interface ZoteroConfigPanelProps {
  config: ZoteroConfig
  onUpdate: (next: ZoteroConfig) => Promise<void>
}

const defaultConfig: ZoteroConfig = {
  endpoint: 'http://localhost:23119',
  userId: '0',
  enabled: false,
}

export function ZoteroConfigPanel(props: ZoteroConfigPanelProps): JSX.Element {
  const { config, onUpdate } = props
  const [draft, setDraft] = useState<ZoteroConfig>({ ...config })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    setDraft({ ...config })
  }, [config])

  useEffect(() => {
    if (saveStatus !== 'saved') {
      return
    }
    const timer = setTimeout(() => {
      setSaveStatus('idle')
    }, 2000)
    return () => clearTimeout(timer)
  }, [saveStatus])

  const dirty = JSON.stringify(draft) !== JSON.stringify(config)

  async function handleSave() {
    setSaveStatus('saving')
    await onUpdate({ ...draft })
    setSaveStatus('saved')
  }

  function handleReset() {
    setDraft({ ...defaultConfig })
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Zotero</p>
          <h3>Zotero 接入</h3>
          <p className="muted-text" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>
            需在 Zotero 桌面端安装 zotero-mcp-plugin（不限版本,Zotero 6/7/8 都支持）。
            装好后 Zotero 会在本机暴露 endpoint,本应用通过 endpoint 直连搜索引文与笔记。
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-3)' }}>
        <label className="field">
          <span>Endpoint</span>
          <input
            type="text"
            value={draft.endpoint}
            placeholder="http://localhost:23119"
            onChange={e => setDraft(prev => ({ ...prev, endpoint: e.target.value }))}
          />
        </label>

        <label className="field">
          <span>User ID</span>
          <input
            type="text"
            value={draft.userId}
            placeholder="0"
            onChange={e => setDraft(prev => ({ ...prev, userId: e.target.value }))}
          />
        </label>

        <p className="muted-text" style={{ fontSize: 'var(--fs-xs)' }}>
          endpoint 一般不用改、userId 留 0 即可（local Zotero）
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', cursor: 'pointer', fontSize: 'var(--fs-sm)' }}>
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={e => setDraft(prev => ({ ...prev, enabled: e.target.checked }))}
          />
          <span>启用 Zotero 集成</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <button
            className="primary-button"
            type="button"
            disabled={!dirty || saveStatus === 'saving'}
            onClick={handleSave}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存'}
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={handleReset}
          >
            重置为默认
          </button>
          {saveStatus === 'saved' && (
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--c-accent-strong)' }}>
              已保存
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
