export type ArticleStatus =
  | 'Drafting'
  | 'Submitted'
  | 'UnderReview'
  | 'Revision'
  | 'Resubmitted'
  | 'Accepted'
  | 'Rejected'
  | 'Published'

export type SectionType =
  | 'Title'
  | 'Abstract'
  | 'Introduction'
  | 'MaterialsAndMethods'
  | 'Results'
  | 'Discussion'
  | 'References'

export type ThesisStatus =
  | 'Proposal'      // 开题
  | 'InProgress'    // 撰写中
  | 'DefenseReady'  // 可答辩
  | 'Defended'      // 已答辩
  | 'Revised'       // 修改中
  | 'Final'         // 终版

export type ThesisSectionType =
  | 'Cover'           // 封面
  | 'Declaration'     // 声明
  | 'Abstract'        // 摘要
  | 'Acknowledgements'// 致谢
  | 'TableOfContents' // 目录
  | 'ListOfFigures'   // 图目录
  | 'ListOfTables'    // 表目录
  | 'Chapter'         // 章节（通用）
  | 'Conclusion'      // 结论
  | 'References'      // 参考文献
  | 'Appendix'        // 附录

export type BlockType = 'Text' | 'Image' | 'FileLink'
export type ReviewCommentType = 'Major' | 'Minor'
export type CommentStatus = 'Pending' | 'InProgress' | 'Completed' | 'Disagreed'

export interface ContentBlockVersion {
  id: string
  content: string
  modifiedAt: string
  modifiedBy: string
  changeDescription: string
}

export interface ContentBlock {
  id: string
  sectionId: string
  type: BlockType
  content: string
  description: string
  orderIndex: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  versions: ContentBlockVersion[]
  resolvedPath?: string | null
  previewUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
}

export interface Section {
  id: string
  type: SectionType
  orderIndex: number
  contentBlocks: ContentBlock[]
}

export interface ResearchContext {
  id: string
  articleId: string
  scientificQuestion: string
  observedPhenomenon: string
  hypothesis: string
  approach: string
  createdAt: string
  updatedAt: string
}

export interface Revision {
  id: string
  reviewCommentId: string
  description: string
  responseText: string
  modifiedBlockIds: string[]
  completedAt: string
  isVerified: boolean
}

export interface ReviewComment {
  id: string
  reviewRoundId: string
  reviewerId: string
  originalText: string
  type: ReviewCommentType
  suggestedSection: string
  status: CommentStatus
  revisions: Revision[]
}

export interface ReviewRound {
  id: string
  articleId: string
  roundNumber: number
  submittedAt: string
  journalName: string
  manuscriptNumber: string
  reviewReceivedAt: string
  comments: ReviewComment[]
}

export interface Article {
  id: string
  title: string
  targetJournal: string
  status: ArticleStatus
  createdAt: string
  updatedAt: string
  researchContext: ResearchContext
  sections: Section[]
  reviewRounds: ReviewRound[]
  citations: unknown[]
}

export interface ThesisSection {
  id: string
  thesisId: string
  type: ThesisSectionType
  title: string
  orderIndex: number
  linkedArticleId?: string
  contentBlocks: ContentBlock[]
}

export interface Thesis {
  id: string
  title: string
  titleEn?: string
  author: string
  supervisor: string
  institution: string
  department: string
  degree: 'Master' | 'PhD'
  status: ThesisStatus
  createdAt: string
  updatedAt: string
  articleIds: string[]
  sections: ThesisSection[]
  abstractZh: string
  abstractEn: string
  keywords: string[]
}

export interface WordCountStats {
  totalWords: number
  totalChars: number
  todayWords: number
  todayChars: number
  sectionCounts: {
    sectionId: string
    sectionType: string
    words: number
    chars: number
  }[]
}

export interface WritingStreak {
  currentStreak: number
  longestStreak: number
  totalWritingDays: number
  todayWords: number
  dailyGoal: number
  lastWriteDate: string
  streakHistory: {
    date: string
    words: number
    goalMet: boolean
  }[]
}

export interface SearchResult {
  id: string
  type: 'article' | 'thesis'
  title: string
  sectionType: string
  content: string
  matchStart: number
  matchEnd: number
  snippet: string
}

export interface AppState {
  baseDirectory: string
  articles: Article[]
  theses: Thesis[]
  writingStreak: WritingStreak
}

export interface McpInfo {
  command: string
  args: string[]
  baseDirectory: string
  configJson: string
  examples?: {
    generic: string
    cursor: string
    claudeCode: string
  }
}

export interface BlockPreview {
  path: string
  previewKind: 'image' | 'pdf' | 'tiff' | 'none'
  fileName: string
  extension: string
  bufferBase64?: string
}

export interface CreateArticlePayload {
  title: string
  targetJournal: string
  status?: ArticleStatus
  researchContext: {
    scientificQuestion: string
    observedPhenomenon: string
    hypothesis: string
    approach: string
  }
}
