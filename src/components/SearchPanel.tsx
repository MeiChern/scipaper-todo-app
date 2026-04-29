// src/components/SearchPanel.tsx

import { useState, useDeferredValue } from 'react'
import type { Article, Thesis, SearchResult } from '../types'
import { searchInContent, highlightMatches } from '../utils/searchEngine'

interface SearchPanelProps {
  articles: Article[]
  theses: Thesis[]
  onSelectResult: (result: SearchResult) => void
}

export function SearchPanel({ articles, theses, onSelectResult }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const deferredQuery = useDeferredValue(query)

  function handleSearch(value: string) {
    setQuery(value)
    if (value.trim().length >= 2) {
      const searchResults = searchInContent(value, articles, theses)
      setResults(searchResults)
    } else {
      setResults([])
    }
  }

  return (
    <section className="panel-card search-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Full-Text Search</p>
          <h3>全文搜索</h3>
        </div>
      </div>

      <label className="field">
        <span>搜索内容</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="输入关键词搜索所有论文和学位论文..."
        />
      </label>

      {deferredQuery.trim().length >= 2 && (
        <div className="search-results">
          <p className="search-results-count">
            找到 {results.length} 个结果
          </p>
          
          {results.length === 0 && (
            <div className="empty-panel">
              <p>没有找到匹配的内容</p>
            </div>
          )}

          {results.slice(0, 50).map((result, index) => (
            <div
              key={`${result.id}-${index}`}
              className="search-result-item"
              onClick={() => onSelectResult(result)}
            >
              <div className="result-header">
                <span className={`result-type ${result.type}`}>
                  {result.type === 'article' ? '论文' : '学位论文'}
                </span>
                <span className="result-section">{result.sectionType}</span>
              </div>
              <div className="result-title">{result.title}</div>
              <div 
                className="result-snippet"
                dangerouslySetInnerHTML={{ 
                  __html: highlightMatches(result.snippet, deferredQuery) 
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
