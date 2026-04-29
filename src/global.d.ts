import type { AppState, ArticleStatus, BlockPreview, CreateArticlePayload, CreateThesisPayload, McpInfo, SectionType, UpdateThesisPayload, WritingStreak } from './types'

declare global {
  interface Window {
    scipaper: {
      bootstrap: () => Promise<AppState>
      getMcpInfo: () => Promise<McpInfo>
      createArticle: (payload: CreateArticlePayload) => Promise<AppState>
      updateArticleMeta: (
        articleId: string,
        patch: { title: string; targetJournal: string; status: ArticleStatus },
      ) => Promise<AppState>
      updateResearchContext: (
        articleId: string,
        researchContext: CreateArticlePayload['researchContext'],
      ) => Promise<AppState>
      addTextBlock: (
        articleId: string,
        sectionType: SectionType,
        content: string,
        description?: string,
      ) => Promise<AppState>
      updateTextBlock: (
        articleId: string,
        blockId: string,
        content: string,
        description?: string,
      ) => Promise<AppState>
      deleteBlock: (articleId: string, blockId: string) => Promise<AppState>
      importAssetBlock: (
        articleId: string,
        sectionType: SectionType,
        kind: 'image' | 'file',
      ) => Promise<AppState>
      openBlockAsset: (articleId: string, blockId: string) => Promise<boolean>
      getBlockPreview: (articleId: string, blockId: string) => Promise<BlockPreview>
      openArticleFolder: (articleId: string) => Promise<boolean>
      addReviewRound: (
        articleId: string,
        payload: {
          submittedAt: string
          journalName: string
          manuscriptNumber: string
          reviewReceivedAt?: string
        },
      ) => Promise<AppState>
      addReviewComment: (
        articleId: string,
        roundId: string,
        payload: {
          reviewerId: string
          originalText: string
          type: 'Major' | 'Minor'
          suggestedSection: string
        },
      ) => Promise<AppState>
      updateReviewCommentStatus: (
        articleId: string,
        roundId: string,
        commentId: string,
        status: 'Pending' | 'InProgress' | 'Completed' | 'Disagreed',
      ) => Promise<AppState>
      addRevision: (
        articleId: string,
        roundId: string,
        commentId: string,
        payload: {
          description: string
          responseText: string
          markCompleted?: boolean
        },
      ) => Promise<AppState>
      exportMarkdown: (articleId: string) => Promise<string>
      getWritingGuidance: (articleId: string, targetSection: SectionType) => Promise<string[]>
      copyText: (text: string) => void
      onStateChanged: (listener: () => void) => () => void

      // Thesis operations
      createThesis: (payload: CreateThesisPayload) => Promise<AppState>
      updateThesisMeta: (thesisId: string, patch: UpdateThesisPayload) => Promise<AppState>
      addThesisSection: (thesisId: string, sectionType: string, title: string) => Promise<AppState>
      linkArticleToThesis: (thesisId: string, articleId: string) => Promise<AppState>
      unlinkArticleFromThesis: (thesisId: string, articleId: string) => Promise<AppState>

      // Writing streak operations
      getWritingStreak: () => Promise<WritingStreak>
      updateDailyGoal: (goal: number) => Promise<AppState>
    }
  }
}

export {}
