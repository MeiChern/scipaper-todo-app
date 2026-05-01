import { useState } from 'react'
import type { JSX } from 'react'

export interface WritingScenario {
  id: string
  name: string
  description: string
  triggerSection: string
  systemPromptAddon: string
  userTemplate?: string
  builtin: boolean
  enabled: boolean
}

interface Props {
  scenarios: WritingScenario[]
  onAdd: (draft: Omit<WritingScenario, 'id' | 'builtin'>) => Promise<void>
  onUpdate: (id: string, patch: Partial<Omit<WritingScenario, 'id' | 'builtin'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onResetToDefault: (id: string) => Promise<void>
}

type Draft = {
  name: string
  description: string
  triggerSection: string
  systemPromptAddon: string
  userTemplate: string
}

const TRIGGER_OPTIONS = [
  'any',
  'Title',
  'Abstract',
  'Introduction',
  'MaterialsAndMethods',
  'Results',
  'Discussion',
  'References',
]

const emptyDraft: Draft = {
  name: '',
  description: '',
  triggerSection: 'any',
  systemPromptAddon: '',
  userTemplate: '',
}

function isValidDraft(d: Draft): boolean {
  return d.name.trim().length > 0 && d.systemPromptAddon.trim().length > 0
}

export function ScenarioLibrary(props: Props): JSX.Element {
  const { scenarios, onAdd, onUpdate, onDelete, onResetToDefault } = props
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addDraft, setAddDraft] = useState<Draft>({ ...emptyDraft })
  const [editDraft, setEditDraft] = useState<Draft>({ ...emptyDraft })

  function startEdit(s: WritingScenario) {
    setEditDraft({
      name: s.name,
      description: s.description,
      triggerSection: s.triggerSection,
      systemPromptAddon: s.systemPromptAddon,
      userTemplate: s.userTemplate ?? '',
    })
    setEditingId(s.id)
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidDraft(addDraft)) return
    await onAdd({
      name: addDraft.name.trim(),
      description: addDraft.description.trim(),
      triggerSection: addDraft.triggerSection,
      systemPromptAddon: addDraft.systemPromptAddon.trim(),
      userTemplate: addDraft.userTemplate.trim() || undefined,
      enabled: true,
    })
    setShowAdd(false)
    setAddDraft({ ...emptyDraft })
  }

  async function submitEdit(e: React.FormEvent, id: string) {
    e.preventDefault()
    if (!isValidDraft(editDraft)) return
    await onUpdate(id, {
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      triggerSection: editDraft.triggerSection,
      systemPromptAddon: editDraft.systemPromptAddon.trim(),
      userTemplate: editDraft.userTemplate.trim() || undefined,
    })
    setEditingId(null)
  }

  function formUI(
    draft: Draft,
    setDraft: React.Dispatch<React.SetStateAction<Draft>>,
    onSubmit: (e: React.FormEvent) => void,
    onCancel: () => void,
    isAdd: boolean,
    disabled?: { name?: boolean; triggerSection?: boolean }
  ) {
    return (
      <form onSubmit={onSubmit} className="tag-form">
        <label className="field">
          <span>Name</span>
          <input
            value={draft.name}
            disabled={disabled?.name}
            onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
            placeholder="场景名称"
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <input
            value={draft.description}
            onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
            placeholder="场景描述"
          />
        </label>
        <label className="field">
          <span>Trigger Section</span>
          <select
            value={draft.triggerSection}
            disabled={disabled?.triggerSection}
            onChange={e => setDraft(prev => ({ ...prev, triggerSection: e.target.value }))}
          >
            {TRIGGER_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>User Template</span>
          <textarea
            rows={3}
            value={draft.userTemplate}
            onChange={e => setDraft(prev => ({ ...prev, userTemplate: e.target.value }))}
            placeholder="启用此场景时预填到 AI 对话框的输入，用户可改"
          />
        </label>
        <label className="field">
          <span>System Prompt Addon</span>
          <textarea
            rows={8}
            value={draft.systemPromptAddon}
            onChange={e => setDraft(prev => ({ ...prev, systemPromptAddon: e.target.value }))}
            placeholder="注入到 LLM system prompt"
            required
          />
        </label>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button className="primary-button" type="submit">{isAdd ? '添加' : '保存'}</button>
          <button className="ghost-button" type="button" onClick={onCancel}>取消</button>
        </div>
      </form>
    )
  }

  return (
    <section className="panel-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Writing Scenarios</p>
          <h3>写作场景库</h3>
          <p className="muted-text" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>
            启用的场景会按当前编辑章节自动注入到 AI Chat 的 system prompt
          </p>
        </div>
        <button
          className="ghost-button"
          onClick={() => { setAddDraft({ ...emptyDraft }); setShowAdd(true) }}
          type="button"
        >
          + 新增自定义场景
        </button>
      </div>

      {showAdd && (
        <div className="panel-card">
          {formUI(addDraft, setAddDraft, submitAdd, () => { setShowAdd(false); setAddDraft({ ...emptyDraft }) }, true)}
        </div>
      )}

      {scenarios.length === 0 && !showAdd && <p className="empty-text">暂无场景</p>}

      {scenarios.map(s => (
        <div key={s.id} className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', minWidth: 0 }}>
              <strong style={{ fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap' }}>{s.name}</strong>
              <span
                className="chip"
                style={{ fontSize: 'var(--fs-xs)', padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--c-panel-sub)', color: 'var(--c-ink-muted)', border: '1px solid var(--c-line)', whiteSpace: 'nowrap' }}
              >
                {s.triggerSection}
              </span>
              <span
                className="chip"
                style={{ fontSize: 'var(--fs-xs)', padding: '2px 8px', borderRadius: 'var(--r-pill)', background: s.builtin ? 'var(--c-accent-soft)' : 'var(--c-panel-sub)', color: s.builtin ? 'var(--c-accent-strong)' : 'var(--c-ink-muted)', border: '1px solid var(--c-line)', whiteSpace: 'nowrap' }}
              >
                {s.builtin ? '内置' : '自定义'}
              </span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', cursor: 'pointer', fontSize: 'var(--fs-xs)', color: 'var(--c-ink-muted)', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={() => onUpdate(s.id, { enabled: !s.enabled })}
              />
              <span>启用</span>
            </label>
          </div>
          <p className="muted-text" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>
            {s.description}
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <button className="ghost-button" onClick={() => startEdit(s)} type="button">编辑</button>
            <button className="ghost-button" onClick={() => s.builtin ? onResetToDefault(s.id) : onDelete(s.id)} type="button">
              {s.builtin ? '恢复默认' : '删除'}
            </button>
          </div>
          {editingId === s.id && (
            <div style={{ marginTop: 'var(--sp-3)' }}>
              {formUI(editDraft, setEditDraft, e => submitEdit(e, s.id), () => setEditingId(null), false, { name: s.builtin, triggerSection: s.builtin })}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
