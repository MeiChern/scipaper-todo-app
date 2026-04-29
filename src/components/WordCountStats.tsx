import type { WordCountStats as WordCountStatsType } from '../types'

interface WordCountStatsProps {
  stats: WordCountStatsType
}

export function WordCountStats({ stats }: WordCountStatsProps) {
  return (
    <section className="panel-card">
      <p className="eyebrow">Writing Statistics</p>
      <h3>字数统计</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">今日字数</span>
          <span className="stat-value">{stats.todayWords.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">总字数</span>
          <span className="stat-value">{stats.totalWords.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">今日字符</span>
          <span className="stat-value">{stats.todayChars.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">总字符</span>
          <span className="stat-value">{stats.totalChars.toLocaleString()}</span>
        </div>
      </div>

      {stats.sectionCounts.length > 0 && (
        <div className="section-counts">
          <p className="eyebrow">各章节字数</p>
          {stats.sectionCounts.map((section) => (
            <div key={section.sectionId} className="section-count-item">
              <span className="section-name">{section.sectionType}</span>
              <span className="section-words">{section.words.toLocaleString()} 字</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
