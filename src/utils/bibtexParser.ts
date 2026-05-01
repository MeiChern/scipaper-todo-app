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

export function formatAuthors(authors: string): string {
  // Split by 'and' and format
  const authorList = authors.split(/\s+and\s+/)
  if (authorList.length === 1) return authorList[0]
  if (authorList.length === 2) return `${authorList[0]} & ${authorList[1]}`
  return `${authorList[0]} et al.`
}