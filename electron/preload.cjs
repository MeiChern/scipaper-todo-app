const { clipboard, contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scipaper', {
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  getMcpInfo: () => ipcRenderer.invoke('app:getMcpInfo'),
  createArticle: (payload) => ipcRenderer.invoke('article:create', payload),
  updateArticleMeta: (articleId, patch) => ipcRenderer.invoke('article:updateMeta', { articleId, patch }),
  updateResearchContext: (articleId, researchContext) =>
    ipcRenderer.invoke('article:updateResearchContext', { articleId, researchContext }),
  addTextBlock: (articleId, sectionType, content, description) =>
    ipcRenderer.invoke('block:addText', { articleId, sectionType, content, description }),
  updateTextBlock: (articleId, blockId, content, description) =>
    ipcRenderer.invoke('block:updateText', { articleId, blockId, content, description }),
  deleteBlock: (articleId, blockId) => ipcRenderer.invoke('block:delete', { articleId, blockId }),
  importAssetBlock: (articleId, sectionType, kind) =>
    ipcRenderer.invoke('block:importAsset', { articleId, sectionType, kind }),
  openBlockAsset: (articleId, blockId) => ipcRenderer.invoke('block:openAsset', { articleId, blockId }),
  getBlockPreview: (articleId, blockId) => ipcRenderer.invoke('block:getPreview', { articleId, blockId }),
  openArticleFolder: (articleId) => ipcRenderer.invoke('article:openFolder', { articleId }),
  addReviewRound: (articleId, payload) => ipcRenderer.invoke('review:addRound', { articleId, payload }),
  addReviewComment: (articleId, roundId, payload) =>
    ipcRenderer.invoke('review:addComment', { articleId, roundId, payload }),
  updateReviewCommentStatus: (articleId, roundId, commentId, status) =>
    ipcRenderer.invoke('review:updateCommentStatus', { articleId, roundId, commentId, status }),
  addRevision: (articleId, roundId, commentId, payload) =>
    ipcRenderer.invoke('review:addRevision', { articleId, roundId, commentId, payload }),
  exportMarkdown: (articleId) => ipcRenderer.invoke('article:exportMarkdown', { articleId }),
  getWritingGuidance: (articleId, targetSection) =>
    ipcRenderer.invoke('article:getWritingGuidance', { articleId, targetSection }),
  copyText: (text) => clipboard.writeText(text),
  onStateChanged: (listener) => {
    const handler = () => listener()
    ipcRenderer.on('state:changed', handler)
    return () => ipcRenderer.removeListener('state:changed', handler)
  },
  // Thesis operations
  createThesis: (payload) => ipcRenderer.invoke('thesis:create', payload),
  updateThesisMeta: (thesisId, patch) => ipcRenderer.invoke('thesis:updateMeta', { thesisId, patch }),
  addThesisSection: (thesisId, sectionType, title) => ipcRenderer.invoke('thesis:addSection', { thesisId, sectionType, title }),
  linkArticleToThesis: (thesisId, articleId) => ipcRenderer.invoke('thesis:linkArticle', { thesisId, articleId }),
  unlinkArticleFromThesis: (thesisId, articleId) => ipcRenderer.invoke('thesis:unlinkArticle', { thesisId, articleId }),
  // Writing streak operations
  getWritingStreak: () => ipcRenderer.invoke('streak:get'),
  updateDailyGoal: (goal) => ipcRenderer.invoke('streak:updateGoal', { goal }),
});
