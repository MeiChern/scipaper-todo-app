import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const storagePath = require.resolve('../electron/storage.cjs')

type StorageModule = typeof import('../electron/storage.cjs')

let tempHomes: string[] = []

function loadStorage(home: string): StorageModule {
  process.env.HOME = home
  delete require.cache[storagePath]
  return require('../electron/storage.cjs') as StorageModule
}

function makeHome() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'scipaper-storage-'))
  tempHomes.push(home)
  return home
}

function createSmokeArticle(storage: StorageModule) {
  return storage.createArticle({
    title: 'Smoke article',
    targetJournal: 'Journal',
    researchContext: {
      scientificQuestion: 'Question',
      observedPhenomenon: 'Phenomenon',
      hypothesis: 'Hypothesis',
      approach: 'Approach',
    },
  })
}

function firstBlock(storage: StorageModule, articleId: string, sectionType = 'Results') {
  const state = storage.loadState()
  const article = state.articles.find((item) => item.id === articleId)
  const section = article?.sections.find((item) => item.type === sectionType)
  return section?.contentBlocks[0]
}

beforeEach(() => {
  tempHomes = []
})

afterEach(() => {
  delete require.cache[storagePath]
  for (const home of tempHomes) {
    fs.rmSync(home, { force: true, recursive: true })
  }
})

describe('storage writing streaks', () => {
  it('persists text edits and added words in the same mutation', () => {
    const storage = loadStorage(makeHome())
    const article = createSmokeArticle(storage)

    storage.addTextBlock(article.id, 'Results', 'one', 'initial')
    const block = firstBlock(storage, article.id)

    expect(block).toBeDefined()
    storage.updateTextBlockWithStreak(article.id, block!.id, 'one two three', 'expanded')

    const state = storage.loadState()
    const updatedBlock = firstBlock(storage, article.id)

    expect(updatedBlock?.content).toBe('one two three')
    expect(state.writingStreak.todayWords).toBe(3)
    expect(state.writingStreak.currentStreak).toBe(1)
    expect(state.writingStreak.streakHistory[0]?.words).toBe(3)
  })

  it('repairs legacy partial writing streak records before updates', () => {
    const storage = loadStorage(makeHome())
    fs.mkdirSync(path.dirname(storage.DATABASE_PATH), { recursive: true })
    fs.writeFileSync(
      storage.DATABASE_PATH,
      JSON.stringify({
        version: 1,
        articles: [],
        writingStreak: {
          currentStreak: 0,
          longestStreak: 0,
          lastWriteDate: null,
          totalWritingDays: 0,
          todayWords: 0,
        },
      }),
      'utf-8',
    )

    const article = createSmokeArticle(storage)
    storage.addTextBlock(article.id, 'Results', 'alpha', 'initial')
    const block = firstBlock(storage, article.id)

    expect(() => storage.updateTextBlockWithStreak(article.id, block!.id, 'alpha beta', 'expanded')).not.toThrow()

    const state = storage.loadState()
    expect(state.writingStreak.dailyGoal).toBe(500)
    expect(state.writingStreak.todayWords).toBe(2)
    expect(state.writingStreak.streakHistory[0]?.words).toBe(2)
  })
})

describe('storage derived data', () => {
  it('uses mixed Chinese and English word counting for writing stats', () => {
    const storage = loadStorage(makeHome())
    const article = createSmokeArticle(storage)

    storage.addTextBlock(article.id, 'Results', '科研写作 test', 'mixed language')

    expect(storage.getWritingStats().totalWords).toBe(5)
  })

  it('creates thesis sections with stable thesis ids and titles', () => {
    const storage = loadStorage(makeHome())
    const thesis = storage.createThesis({
      title: 'Thesis',
      titleEn: 'Thesis',
      author: 'Author',
      supervisor: 'Supervisor',
      institution: 'Institution',
      department: 'Department',
      degree: 'Master',
      abstractZh: '',
      abstractEn: '',
      keywords: [],
    })

    expect(thesis.sections.length).toBeGreaterThan(0)
    expect(thesis.sections.every((section) => section.thesisId === thesis.id)).toBe(true)
    expect(thesis.sections.every((section) => section.title.length > 0)).toBe(true)
  })
})
