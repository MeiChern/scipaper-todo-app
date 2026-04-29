// src/utils/wordCounter.ts

import type { Article, Thesis, WordCountStats } from '../types'

export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0
  
  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/)
  
  // Filter out empty strings
  return words.filter(word => word.length > 0).length
}

export function countChineseChars(text: string): number {
  if (!text) return 0
  
  // Match Chinese characters
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g)
  return chineseChars ? chineseChars.length : 0
}

export function countTotalChars(text: string): number {
  if (!text) return 0
  return text.replace(/\s/g, '').length
}

export function getWordCountStats(
  articles: Article[],
  theses: Thesis[],
  todayDate: string
): WordCountStats {
  let totalWords = 0
  let totalChars = 0
  let todayWords = 0
  let todayChars = 0
  const sectionCounts: WordCountStats['sectionCounts'] = []
  
  // Count words in articles
  articles.forEach(article => {
    article.sections.forEach(section => {
      let sectionWords = 0
      let sectionChars = 0
      
      section.contentBlocks.forEach(block => {
        if (block.type === 'Text') {
          const words = countWords(block.content)
          const chars = countTotalChars(block.content)
          sectionWords += words
          sectionChars += chars
          
          // Check if today
          const blockDate = new Date(block.updatedAt).toISOString().split('T')[0]
          if (blockDate === todayDate) {
            todayWords += words
            todayChars += chars
          }
        }
      })
      
      totalWords += sectionWords
      totalChars += sectionChars
      
      sectionCounts.push({
        sectionId: section.id,
        sectionType: section.type,
        words: sectionWords,
        chars: sectionChars
      })
    })
  })
  
  // Count words in theses
  theses.forEach(thesis => {
    thesis.sections.forEach(section => {
      let sectionWords = 0
      let sectionChars = 0
      
      section.contentBlocks.forEach(block => {
        if (block.type === 'Text') {
          const words = countWords(block.content)
          const chars = countTotalChars(block.content)
          sectionWords += words
          sectionChars += chars
          
          const blockDate = new Date(block.updatedAt).toISOString().split('T')[0]
          if (blockDate === todayDate) {
            todayWords += words
            todayChars += chars
          }
        }
      })
      
      totalWords += sectionWords
      totalChars += sectionChars
      
      sectionCounts.push({
        sectionId: section.id,
        sectionType: section.title || section.type,
        words: sectionWords,
        chars: sectionChars
      })
    })
  })
  
  return {
    totalWords,
    totalChars,
    todayWords,
    todayChars,
    sectionCounts
  }
}
