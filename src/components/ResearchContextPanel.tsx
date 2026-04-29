import { useEffect, useState } from 'react'
import type { Article, CreateArticlePayload } from '../types'

interface ResearchContextPanelProps {
  article: Article
  onSave: (researchContext: CreateArticlePayload['researchContext']) => Promise<void>
}

export function ResearchContextPanel({ article, onSave }: ResearchContextPanelProps) {
  const [draft, setDraft] = useState(article.researchContext)

  useEffect(() => {
    setDraft(article.researchContext)
  }, [article.id, article.researchContext])

  return (
    <div className="panel-stack">
      <section className="panel-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Research Context</p>
            <h3>核心科研问题</h3>
          </div>
          <button
            className="primary-button"
            onClick={() =>
              onSave({
                scientificQuestion: draft.scientificQuestion,
                observedPhenomenon: draft.observedPhenomenon,
                hypothesis: draft.hypothesis,
                approach: draft.approach,
              })
            }
            type="button"
          >
            保存上下文
          </button>
        </div>

        <div className="form-grid context-grid">
          <label className="field">
            <span>你想解决什么科学问题？</span>
            <textarea
              rows={5}
              value={draft.scientificQuestion}
              onChange={(event) => setDraft({ ...draft, scientificQuestion: event.target.value })}
            />
          </label>
          <label className="field">
            <span>你发现了什么科学现象？</span>
            <textarea
              rows={5}
              value={draft.observedPhenomenon}
              onChange={(event) => setDraft({ ...draft, observedPhenomenon: event.target.value })}
            />
          </label>
          <label className="field">
            <span>你的假设是什么？</span>
            <textarea rows={5} value={draft.hypothesis} onChange={(event) => setDraft({ ...draft, hypothesis: event.target.value })} />
          </label>
          <label className="field">
            <span>你准备怎么做？</span>
            <textarea rows={5} value={draft.approach} onChange={(event) => setDraft({ ...draft, approach: event.target.value })} />
          </label>
        </div>
      </section>
    </div>
  )
}
