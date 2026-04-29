import { useState } from 'react'
import type { WritingStreak as WritingStreakType } from '../types'
import { getHeatmapData } from '../utils/streakTracker'

interface WritingStreakProps {
  streak: WritingStreakType
  onUpdateGoal: (goal: number) => Promise<void>
}

export function WritingStreak({ streak, onUpdateGoal }: WritingStreakProps) {
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goalDraft, setGoalDraft] = useState(streak.dailyGoal.toString())
  
  const heatmapData = getHeatmapData(streak.streakHistory, 28)
  
  async function handleUpdateGoal() {
    const newGoal = parseInt(goalDraft, 10)
    if (!isNaN(newGoal) && newGoal >= 0) {
      await onUpdateGoal(newGoal)
      setShowGoalInput(false)
    }
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Writing Streak</p>
          <h3>写作打卡</h3>
        </div>
        <div className="streak-badge">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak.currentStreak}</span>
        </div>
      </div>

      <div className="streak-stats">
        <div className="streak-stat">
          <span className="streak-stat-label">当前连续</span>
          <span className="streak-stat-value">{streak.currentStreak} 天</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-label">最长连续</span>
          <span className="streak-stat-value">{streak.longestStreak} 天</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-label">写作天数</span>
          <span className="streak-stat-value">{streak.totalWritingDays} 天</span>
        </div>
      </div>

      <div className="daily-progress">
        <div className="progress-header">
          <span>今日进度</span>
          <span>{streak.todayWords} / {streak.dailyGoal} 字</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(100, (streak.todayWords / streak.dailyGoal) * 100)}%` 
            }}
          />
        </div>
        {streak.todayWords >= streak.dailyGoal && (
          <div className="goal-met">✅ 今日目标已完成！</div>
        )}
      </div>

      {showGoalInput ? (
        <div className="goal-input-row">
          <input
            type="number"
            value={goalDraft}
            onChange={(e) => setGoalDraft(e.target.value)}
            placeholder="每日目标字数"
            min="0"
          />
          <button className="ghost-button" onClick={handleUpdateGoal}>
            保存
          </button>
          <button className="ghost-button" onClick={() => setShowGoalInput(false)}>
            取消
          </button>
        </div>
      ) : (
        <button 
          className="ghost-button full-width" 
          onClick={() => setShowGoalInput(true)}
        >
          设置每日目标 (当前: {streak.dailyGoal} 字)
        </button>
      )}

      <div className="heatmap-section">
        <p className="eyebrow">过去 28 天</p>
        <div className="heatmap-grid">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className={`heatmap-cell heatmap-level-${day.level}`}
              title={`${day.date}: ${day.words} 字`}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>少</span>
          <div className="heatmap-cell heatmap-level-0" />
          <div className="heatmap-cell heatmap-level-1" />
          <div className="heatmap-cell heatmap-level-2" />
          <div className="heatmap-cell heatmap-level-3" />
          <div className="heatmap-cell heatmap-level-4" />
          <span>多</span>
        </div>
      </div>
    </section>
  )
}
