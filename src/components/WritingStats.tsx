import type { WritingStats as WritingStatsType } from '../types'

interface WritingStatsProps {
  stats: WritingStatsType
}

export function WritingStats({ stats }: WritingStatsProps) {
  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Writing Statistics</p>
          <h3>写作统计面板</h3>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-number">{stats.totalArticles}</span>
          <span className="stat-label">总文章数</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalWords.toLocaleString()}</span>
          <span className="stat-label">总字数</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.averageWordsPerArticle.toLocaleString()}</span>
          <span className="stat-label">平均字数/篇</span>
        </div>
      </div>

      {stats.topSections.length > 0 && (
        <div className="stats-section">
          <p className="eyebrow">章节分布</p>
          <div className="section-bars">
            {stats.topSections.slice(0, 5).map((section, index) => {
              const maxWords = Math.max(...stats.topSections.map(s => s.words))
              const percentage = maxWords > 0 ? (section.words / maxWords) * 100 : 0
              
              return (
                <div key={index} className="section-bar-item">
                  <span className="section-name">{section.section}</span>
                  <div className="section-bar">
                    <div 
                      className="section-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="section-words">{section.words.toLocaleString()} 字</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stats.mostUsedWords.length > 0 && (
        <div className="stats-section">
          <p className="eyebrow">常用词汇</p>
          <div className="word-cloud">
            {stats.mostUsedWords.slice(0, 15).map((word, index) => (
              <span 
                key={index} 
                className="word-tag"
                style={{ 
                  fontSize: `${Math.max(12, Math.min(24, 12 + word.count / 5))}px`,
                  opacity: Math.max(0.6, 1 - index * 0.05)
                }}
              >
                {word.word}
                <span className="word-count">{word.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
