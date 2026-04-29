// src/utils/searchEngine.ts

import type { Article, Thesis, SearchResult } from '../types'

export function searchInContent(
  query: string,
  articles: Article[],
  theses: Thesis[]
): SearchResult[] {
  if (!query || query.trim().length === 0) return []
  
  const results: SearchResult[] = []
  const normalizedQuery = query.toLowerCase().trim()
  
  // Search in articles
  articles.forEach(article => {
    // Search in title
    if (article.title.toLowerCase().includes(normalizedQuery)) {
      results.push({
        id: article.id,
        type: 'article',
        title: article.title,
        sectionType: 'Title',
        content: article.title,
        matchStart: article.title.toLowerCase().indexOf(normalizedQuery),
        matchEnd: article.title.toLowerCase().indexOf(normalizedQuery) + normalizedQuery.length,
        snippet: getSnippet(article.title, normalizedQuery)
      })
    }
    
    // Search in sections
    article.sections.forEach(section => {
      section.contentBlocks.forEach(block => {
        if (block.type === 'Text' && block.content.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: block.id,
            type: 'article',
            title: article.title,
            sectionType: section.type,
            content: block.content,
            matchStart: block.content.toLowerCase().indexOf(normalizedQuery),
            matchEnd: block.content.toLowerCase().indexOf(normalizedQuery) + normalizedQuery.length,
            snippet: getSnippet(block.content, normalizedQuery)
          })
        }
      })
    })
    
    // Search in research context
    const contextFields = [
      article.researchContext.scientificQuestion,
      article.researchContext.observedPhenomenon,
      article.researchContext.hypothesis,
      article.researchContext.approach
    ]
    
    contextFields.forEach(field => {
      if (field && field.toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: article.id + '-context',
          type: 'article',
          title: article.title,
          sectionType: 'Research Context',
          content: field,
          matchStart: field.toLowerCase().indexOf(normalizedQuery),
          matchEnd: field.toLowerCase().indexOf(normalizedQuery) + normalizedQuery.length,
          snippet: getSnippet(field, normalizedQuery)
        })
      }
    })
  })
  
  // Search in theses
  theses.forEach(thesis => {
    // Search in title
    if (thesis.title.toLowerCase().includes(normalizedQuery)) {
      results.push({
        id: thesis.id,
        type: 'thesis',
        title: thesis.title,
        sectionType: 'Title',
        content: thesis.title,
        matchStart: thesis.title.toLowerCase().indexOf(normalizedQuery),
        matchEnd: thesis.title.toLowerCase().indexOf(normalizedQuery) + normalizedQuery.length,
        snippet: getSnippet(thesis.title, normalizedQuery)
      })
    }
    
    // Search in sections
    thesis.sections.forEach(section => {
      section.contentBlocks.forEach(block => {
        if (block.type === 'Text' && block.content.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: block.id,
            type: 'thesis',
            title: thesis.title,
            sectionType: section.title || section.type,
            content: block.content,
            matchStart: block.content.toLowerCase().indexOf(normalizedQuery),
            matchEnd: block.content.toLowerCase().indexOf(normalizedQuery) + normalizedQuery.length,
            snippet: getSnippet(block.content, normalizedQuery)
          })
        }
      })
    })
  })
  
  return results
}

function getSnippet(content: string, query: string, contextLength: number = 50): string {
  const index = content.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return content.substring(0, 100) + '...'
  
  const start = Math.max(0, index - contextLength)
  const end = Math.min(content.length, index + query.length + contextLength)
  
  let snippet = ''
  if (start > 0) snippet += '...'
  snippet += content.substring(start, end)
  if (end < content.length) snippet += '...'
  
  return snippet
}

export function highlightMatches(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
