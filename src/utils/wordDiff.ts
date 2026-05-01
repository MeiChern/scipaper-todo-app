export interface WordDiffResult {
  addedChars: number
  removedChars: number
  changedChars: number
  netChars: number
  oldCount: number
  newCount: number
}

const TOKEN_REGEX =
  /([\u4e00-\u9fa5])|([a-zA-Z]+(?:[''-][a-zA-Z]+)*)|(\d+(?:\.\d+)?)|(\s+)|([^\s一-龥\w])/g

function tokenize(text: string): string[] {
  const tokens: string[] = []
  let match: RegExpExecArray | null

  while ((match = TOKEN_REGEX.exec(text)) !== null) {
    if (match[4] === undefined) {
      tokens.push(match[0])
    }
  }

  TOKEN_REGEX.lastIndex = 0
  return tokens
}

function tokenWeight(token: string): number {
  if (
    /^[一-龥]$/.test(token) ||
    /^[a-zA-Z]+(?:[''-][a-zA-Z]+)*$/.test(token) ||
    /^\d+(?:\.\d+)?$/.test(token)
  ) {
    return 1
  }

  return 0
}

function lcsCount(a: string[], b: string[]): number {
  const columns = a.length <= b.length ? a : b
  const rows = a.length <= b.length ? b : a
  let previous = new Array<number>(columns.length + 1).fill(0)

  for (const rowToken of rows) {
    const current = new Array<number>(columns.length + 1).fill(0)

    for (let columnIndex = 1; columnIndex <= columns.length; columnIndex += 1) {
      const columnToken = columns[columnIndex - 1]
      const skipRow = previous[columnIndex]
      const skipColumn = current[columnIndex - 1]

      if (rowToken === columnToken) {
        current[columnIndex] = Math.max(
          previous[columnIndex - 1] + tokenWeight(rowToken),
          skipRow,
          skipColumn,
        )
      } else {
        current[columnIndex] = Math.max(skipRow, skipColumn)
      }
    }

    previous = current
  }

  return previous[columns.length]
}

export function countWords(text: string): number {
  const chineseChars = text.match(/[一-龥]/g) ?? []
  const englishWords = text
    .replace(/[一-龥]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return chineseChars.length + englishWords
}

export function diffWords(oldText: string, newText: string): WordDiffResult {
  const safeOldText = oldText ?? ''
  const safeNewText = newText ?? ''
  const oldCount = countWords(safeOldText)
  const newCount = countWords(safeNewText)

  if (safeOldText === safeNewText) {
    return {
      addedChars: 0,
      removedChars: 0,
      changedChars: 0,
      netChars: 0,
      oldCount,
      newCount,
    }
  }

  const oldTokens = tokenize(safeOldText)
  const newTokens = tokenize(safeNewText)
  let addedChars: number
  let removedChars: number

  if (oldTokens.length > 5000 || newTokens.length > 5000) {
    addedChars = Math.max(0, newCount - oldCount)
    removedChars = Math.max(0, oldCount - newCount)
  } else {
    const commonCount = lcsCount(oldTokens, newTokens)
    addedChars = Math.max(0, newCount - commonCount)
    removedChars = Math.max(0, oldCount - commonCount)
  }

  return {
    addedChars,
    removedChars,
    changedChars: addedChars + removedChars,
    netChars: newCount - oldCount,
    oldCount,
    newCount,
  }
}

export const __tests = [
  {
    label: 'empty to hello',
    input: ['', 'hello'],
    expect: { addedChars: 1, removedChars: 0 },
  },
  {
    label: 'hello world to hello',
    input: ['hello world', 'hello'],
    expect: { addedChars: 0, removedChars: 1 },
  },
  {
    label: 'chinese swap',
    input: ['我是张三', '我是李四'],
    expect: { addedChars: 2, removedChars: 2 },
  },
]
