import { useState } from 'react'
import type { Article, Section } from '../types'

interface OutlineViewProps {
  articles: Article[]
  selectedArticleId: string | null
  onSelectArticle: (articleId: string) => void
  onSelectSection: (sectionType: string) => void
}

export function OutlineView({ articles, selectedArticleId, onSelectArticle, onSelectSection }: OutlineViewProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())

  function toggleArticle(articleId: string) {
    const next = new Set(expandedArticles)
    if (next.has(articleId)) {
      next.delete(articleId)
    } else {
      next.add(articleId)
    }
    setExpandedArticles(next)
  }

  function getSectionSummary(section: Section): string {
    const textBlocks = section.contentBlocks.filter(b => b.type === 'Text')
    if (textBlocks.length === 0) return '空'
    const totalWords = textBlocks.reduce((sum, b) => sum + b.content.split(/\s+/).length, 0)
    return `${totalWords} 字`
  }

  return (
    <section className="panel-card outline-view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Outline</p>
          <h3>大纲视图</h3>
        </div>
      </div>

      <div className="outline-tree">
        {articles.map(article => (
          <div key={article.id} className="outline-article">
            <div 
              className={`outline-article-header ${selectedArticleId === article.id ? 'selected' : ''}`}
              onClick={() => {
                onSelectArticle(article.id)
                toggleArticle(article.id)
              }}
            >
              <span className="outline-toggle">{expandedArticles.has(article.id) ? '▼' : '▶'}</span>
              <span className="outline-title">{article.title}</span>
              <span className="outline-meta">{article.sections.length} 章节</span>
            </div>

            {expandedArticles.has(article.id) && (
              <div className="outline-sections">
                {article.sections.map(section => (
                  <div 
                    key={section.id} 
                    className="outline-section"
                    onClick={() => onSelectSection(section.type)}
                  >
                    <span className="outline-section-type">{section.type}</span>
                    <span className="outline-section-summary">{getSectionSummary(section)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {articles.length === 0 && (
          <div className="empty-panel">
            <p>暂无文章</p>
          </div>
        )}
      </div>
    </section>
  )
}
