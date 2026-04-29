// src/utils/streakTracker.ts

import type { WritingStreak } from '../types'

export function calculateStreak(
  streakHistory: WritingStreak['streakHistory'],
  dailyGoal: number
): {
  currentStreak: number
  longestStreak: number
  totalWritingDays: number
} {
  if (!streakHistory || streakHistory.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalWritingDays: 0 }
  }
  
  // Sort by date descending
  const sorted = [...streakHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let totalWritingDays = 0
  
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    
    if (entry.words > 0) {
      totalWritingDays++
    }
    
    // Check if goal was met
    if (entry.words >= dailyGoal) {
      if (i === 0 && (entry.date === today || entry.date === yesterday)) {
        // Current streak starts from today or yesterday
        currentStreak = 1
        tempStreak = 1
      } else if (tempStreak > 0) {
        // Check if consecutive days
        const prevDate = new Date(sorted[i - 1].date)
        const currDate = new Date(entry.date)
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / 86400000
        )
        
        if (diffDays === 1) {
          tempStreak++
          currentStreak = tempStreak
        } else {
          tempStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }
  
  return { currentStreak, longestStreak, totalWritingDays }
}

export function updateStreakHistory(
  streak: WritingStreak,
  todayWords: number,
  dailyGoal: number
): WritingStreak {
  const today = new Date().toISOString().split('T')[0]
  
  // Find or create today's entry
  const history = [...streak.streakHistory]
  const todayIndex = history.findIndex(h => h.date === today)
  
  if (todayIndex >= 0) {
    history[todayIndex] = {
      date: today,
      words: todayWords,
      goalMet: todayWords >= dailyGoal
    }
  } else {
    history.push({
      date: today,
      words: todayWords,
      goalMet: todayWords >= dailyGoal
    })
  }
  
  // Keep only last 365 days
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0]
  const filteredHistory = history.filter(h => h.date >= oneYearAgo)
  
  const { currentStreak, longestStreak, totalWritingDays } = calculateStreak(
    filteredHistory,
    dailyGoal
  )
  
  return {
    currentStreak,
    longestStreak,
    totalWritingDays,
    todayWords,
    dailyGoal,
    lastWriteDate: today,
    streakHistory: filteredHistory,
    moodHistory: []
  }
}

export function getHeatmapData(
  streakHistory: WritingStreak['streakHistory'],
  days: number = 28
): { date: string; words: number; level: number }[] {
  const result = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const entry = streakHistory.find(h => h.date === dateStr)
    
    const words = entry?.words || 0
    let level = 0
    if (words > 0) level = 1
    if (words > 500) level = 2
    if (words > 1000) level = 3
    if (words > 2000) level = 4
    
    result.push({ date: dateStr, words, level })
  }
  
  return result
}
