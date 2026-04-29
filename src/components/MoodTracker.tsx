import { useState } from 'react'
import type { MoodType, MoodEntry } from '../types'

interface MoodTrackerProps {
  moodHistory: MoodEntry[]
  onAddMood: (mood: MoodType, note?: string) => Promise<void>
}

const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'Happy', emoji: '😊', label: '开心' },
  { type: 'Calm', emoji: '😌', label: '平静' },
  { type: 'Sad', emoji: '😔', label: '难过' },
  { type: 'Frustrated', emoji: '😤', label: '沮丧' },
  { type: 'Anxious', emoji: '😰', label: '焦虑' },
  { type: 'Excited', emoji: '🤩', label: '兴奋' },
  { type: 'Tired', emoji: '😴', label: '疲惫' },
  { type: 'Grateful', emoji: '🥰', label: '感恩' },
  { type: 'Motivated', emoji: '🔥', label: '动力满满' },
  { type: 'Melancholy', emoji: '🌧️', label: '忧郁' },
]

export function MoodTracker({ moodHistory, onAddMood }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  async function handleAddMood() {
    if (!selectedMood) return
    await onAddMood(selectedMood, note)
    setSelectedMood(null)
    setNote('')
  }

  const today = new Date().toISOString().split('T')[0]
  const todayMood = moodHistory.find(m => m.date === today)

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mood Tracker</p>
          <h3>心情追踪</h3>
        </div>
        <button 
          className="ghost-button" 
          onClick={() => setShowHistory(!showHistory)}
          type="button"
        >
          {showHistory ? '隐藏历史' : '查看历史'}
        </button>
      </div>

      {todayMood ? (
        <div className="today-mood">
          <p>今日心情：{MOOD_OPTIONS.find(m => m.type === todayMood.mood)?.emoji} {MOOD_OPTIONS.find(m => m.type === todayMood.mood)?.label}</p>
          {todayMood.note && <p className="mood-note">{todayMood.note}</p>}
        </div>
      ) : (
        <>
          <div className="mood-grid">
            {MOOD_OPTIONS.map(mood => (
              <button
                key={mood.type}
                className={`mood-button ${selectedMood === mood.type ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.type)}
                type="button"
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="mood-form">
              <label className="field">
                <span>备注（可选）</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录一下今天的心情..."
                />
              </label>
              <button className="primary-button" onClick={handleAddMood} type="button">
                记录心情
              </button>
            </div>
          )}
        </>
      )}

      {showHistory && moodHistory.length > 0 && (
        <div className="mood-history">
          <p className="eyebrow">最近心情</p>
          {moodHistory.slice(-7).reverse().map(entry => (
            <div key={entry.id} className="mood-entry">
              <span className="mood-date">{entry.date}</span>
              <span className="mood-emoji">{MOOD_OPTIONS.find(m => m.type === entry.mood)?.emoji}</span>
              {entry.note && <span className="mood-note">{entry.note}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
