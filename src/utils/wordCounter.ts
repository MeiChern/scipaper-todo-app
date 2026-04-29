// src/utils/wordCounter.ts

import type { Article, Thesis, WordCountStats } from '../types'

function processSections(
  items: { sections: { id: string; type: string; title?: string; contentBlocks: { type: string; content: string; updatedAt: string }[] }[] }[],
  todayDate: string,
  getLabel: (section: { type: string; title?: string }) => string,
  totals: { words: number; chars: number; todayWords: number; todayChars: number },
  sectionCounts: WordCountStats['sectionCounts']
): void {
  items.forEach(item => {
    item.sections.forEach(section => {
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
            totals.todayWords += words
            totals.todayChars += chars
          }
        }
      })

      totals.words += sectionWords
      totals.chars += sectionChars

      sectionCounts.push({
        sectionId: section.id,
        sectionType: getLabel(section),
        words: sectionWords,
        chars: sectionChars
      })
    })
  })
}

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
  const totals = { words: 0, chars: 0, todayWords: 0, todayChars: 0 }
  const sectionCounts: WordCountStats['sectionCounts'] = []

  processSections(articles, todayDate, s => s.type, totals, sectionCounts)
  // Theses use title || type because thesis sections have descriptive titles
  // (e.g. "Abstract", "Introduction") that are more meaningful than generic types
  processSections(theses, todayDate, s => s.title || s.type, totals, sectionCounts)

  const { words: totalWords, chars: totalChars, todayWords, todayChars } = totals
  
  return {
    totalWords,
    totalChars,
    todayWords,
    todayChars,
    sectionCounts
  }
}
