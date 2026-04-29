export interface BibTeXEntry {
  key: string
  type: string
  title: string
  authors: string
  year: string
  journal?: string
  volume?: string
  number?: string
  pages?: string
  publisher?: string
  doi?: string
  url?: string
  abstract?: string
}

export function parseBibTeX(bibtex: string): BibTeXEntry[] {
  const entries: BibTeXEntry[] = []
  
  // Match each entry
  const entryRegex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\}/g
  let match
  
  while ((match = entryRegex.exec(bibtex)) !== null) {
    const type = match[1].toLowerCase()
    const key = match[2].trim()
    const fieldsStr = match[3]
    
    // Parse fields
    const fields: Record<string, string> = {}
    const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g
    let fieldMatch
    
    while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim()
    }
    
    entries.push({
      key,
      type,
      title: fields.title || '',
      authors: fields.author || fields.editor || '',
      year: fields.year || '',
      journal: fields.journal || fields.booktitle,
      volume: fields.volume,
      number: fields.number,
      pages: fields.pages,
      publisher: fields.publisher,
      doi: fields.doi,
      url: fields.url,
      abstract: fields.abstract
    })
  }
  
  return entries
}

export function formatBibTeXEntry(entry: BibTeXEntry): string {
  const fields: string[] = []
  
  if (entry.title) fields.push(`  title = {${entry.title}}`)
  if (entry.authors) fields.push(`  author = {${entry.authors}}`)
  if (entry.year) fields.push(`  year = {${entry.year}}`)
  if (entry.journal) fields.push(`  journal = {${entry.journal}}`)
  if (entry.volume) fields.push(`  volume = {${entry.volume}}`)
  if (entry.number) fields.push(`  number = {${entry.number}}`)
  if (entry.pages) fields.push(`  pages = {${entry.pages}}`)
  if (entry.publisher) fields.push(`  publisher = {${entry.publisher}}`)
  if (entry.doi) fields.push(`  doi = {${entry.doi}}`)
  if (entry.url) fields.push(`  url = {${entry.url}}`)
  
  return `@${entry.type}{${entry.key},\n${fields.join(',\n')}\n}`
}

export function extractDoi(doi: string): string {
  // Remove URL prefix if present
  return doi.replace(/^https?:\/\/doi\.org\//, '')
}

export function formatAuthors(authors: string): string {
  // Split by 'and' and format
  const authorList = authors.split(/\s+and\s+/)
  if (authorList.length === 1) return authorList[0]
  if (authorList.length === 2) return `${authorList[0]} & ${authorList[1]}`
  return `${authorList[0]} et al.`
}