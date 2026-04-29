import { useState, useEffect, useRef } from 'react'
import type { PomodoroStats } from '../types'

interface PomodoroTimerProps {
  stats: PomodoroStats
  onAddSession: (duration: number) => Promise<void>
}

const PRESET_DURATIONS = [15, 25, 30, 45, 60]

export function PomodoroTimer({ stats, onAddSession }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsRunning(false)
            onAddSession(duration)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, isPaused, duration, onAddSession])

  function startTimer() {
    setTimeLeft(duration * 60)
    setIsRunning(true)
    setIsPaused(false)
  }

  function pauseTimer() {
    setIsPaused(!isPaused)
  }

  function stopTimer() {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(duration * 60)
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Pomodoro Timer</p>
          <h3>番茄钟</h3>
        </div>
      </div>

      <div className="pomodoro-stats">
        <div className="pomodoro-stat">
          <span className="pomodoro-stat-label">今日</span>
          <span className="pomodoro-stat-value">{stats.todaySessions} 次</span>
        </div>
        <div className="pomodoro-stat">
          <span className="pomodoro-stat-label">今日时长</span>
          <span className="pomodoro-stat-value">{stats.todayMinutes} 分钟</span>
        </div>
        <div className="pomodoro-stat">
          <span className="pomodoro-stat-label">总计</span>
          <span className="pomodoro-stat-value">{stats.totalSessions} 次</span>
        </div>
      </div>

      <div className="pomodoro-timer">
        <div className="timer-display">
          <div className="timer-circle">
            <svg viewBox="0 0 100 100">
              <circle
                className="timer-bg"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--line)"
                strokeWidth="8"
              />
              <circle
                className="timer-progress"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="timer-time">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {!isRunning ? (
          <div className="duration-selector">
            <p className="eyebrow">选择时长</p>
            <div className="duration-options">
              {PRESET_DURATIONS.map(d => (
                <button
                  key={d}
                  className={`duration-button ${duration === d ? 'selected' : ''}`}
                  onClick={() => {
                    setDuration(d)
                    setTimeLeft(d * 60)
                  }}
                  type="button"
                >
                  {d}分钟
                </button>
              ))}
            </div>
            <button className="primary-button" onClick={startTimer} type="button">
              开始专注
            </button>
          </div>
        ) : (
          <div className="timer-controls">
            <button className="ghost-button" onClick={pauseTimer} type="button">
              {isPaused ? '继续' : '暂停'}
            </button>
            <button className="ghost-button" onClick={stopTimer} type="button">
              停止
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
