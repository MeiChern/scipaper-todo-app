import { useDeferredValue, useEffect, useState } from 'react'
import { ArticleWizard } from './components/ArticleWizard'
import { McpPanel } from './components/McpPanel'
import { ResearchContextPanel } from './components/ResearchContextPanel'
import { ReviewPanel } from './components/ReviewPanel'
import { SearchPanel } from './components/SearchPanel'
import { SectionEditor } from './components/SectionEditor'
import { ThesisWizard } from './components/ThesisWizard'
import { WordCountStats } from './components/WordCountStats'
import { WritingStreak } from './components/WritingStreak'
import type { AppState, ArticleStatus, CreateArticlePayload, CreateThesisPayload, McpInfo, SearchResult, SectionType } from './types'
import { getWordCountStats } from './utils/wordCounter'

const SECTION_LABELS: Record<SectionType, string> = {
  Title: '题目',
  Abstract: '摘要',
  Introduction: '前言',
  MaterialsAndMethods: '材料方法',
  Results: '结果',
  Discussion: '讨论',
  References: '参考文献',
}

type WorkspaceTab = SectionType | 'ResearchContext' | 'Review' | 'Mcp' | 'Search' | 'Stats'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return '早上好'
  }

  if (hour < 18) {
    return '下午好'
  }

  return '晚上好'
}

function formatStatus(status: ArticleStatus) {
  const labels: Record<ArticleStatus, string> = {
    Drafting: '撰写中',
    Submitted: '已投稿',
    UnderReview: '审稿中',
    Revision: '返修中',
    Resubmitted: '已修回',
    Accepted: '已接收',
    Rejected: '已拒稿',
    Published: '已发表',
  }

  return labels[status]
}

function App() {
  const [state, setState] = useState<AppState | null>(null)
  const [mcpInfo, setMcpInfo] = useState<McpInfo | null>(null)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Introduction')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [thesisWizardOpen, setThesisWizardOpen] = useState(false)
  const [metaDraft, setMetaDraft] = useState({
    title: '',
    targetJournal: '',
    status: 'Drafting' as ArticleStatus,
  })
  const deferredSearch = useDeferredValue(search)
  const greeting = getGreeting()

  async function refreshStateSilently() {
    const nextState = await window.scipaper.bootstrap()
    setState(nextState)

    setSelectedArticleId((currentId) => {
      if (currentId && nextState.articles.some((article) => article.id === currentId)) {
        return currentId
      }

      return nextState.articles[0]?.id ?? null
    })
  }

  useEffect(() => {
    async function bootstrap() {
      const [nextState, nextMcpInfo] = await Promise.all([window.scipaper.bootstrap(), window.scipaper.getMcpInfo()])

      setState(nextState)
      setMcpInfo(nextMcpInfo)
      setSelectedArticleId(nextState.articles[0]?.id ?? null)
    }

    bootstrap().catch((error) => {
      console.error(error)
      setNotice('初始化失败，请重启应用。')
    })
  }, [])

  useEffect(() => {
    const unsubscribe = window.scipaper.onStateChanged(() => {
      refreshStateSilently().catch((error) => {
        console.error(error)
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const selectedArticle = state?.articles.find((article) => article.id === selectedArticleId) ?? null

  useEffect(() => {
    if (!selectedArticle) {
      return
    }

    setMetaDraft({
      title: selectedArticle.title,
      targetJournal: selectedArticle.targetJournal,
      status: selectedArticle.status,
    })
  }, [selectedArticle?.id])

  const filteredArticles =
    state?.articles.filter((article) => {
      const keyword = deferredSearch.trim().toLowerCase()

      if (!keyword) {
        return true
      }

      const haystack = [
        article.title,
        article.targetJournal,
        article.researchContext.scientificQuestion,
        article.researchContext.observedPhenomenon,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    }) ?? []

  async function mutate(action: () => Promise<AppState>, successMessage?: string) {
    try {
      setBusy(true)
      const nextState = await action()
      setState(nextState)

      if (!selectedArticleId && nextState.articles[0]) {
        setSelectedArticleId(nextState.articles[0].id)
      }

      if (selectedArticleId && !nextState.articles.find((item) => item.id === selectedArticleId)) {
        setSelectedArticleId(nextState.articles[0]?.id ?? null)
      }

      if (successMessage) {
        setNotice(successMessage)
      }
    } catch (error) {
      console.error(error)
      setNotice(error instanceof Error ? error.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateArticle(payload: CreateArticlePayload) {
    await mutate(async () => {
      const nextState = await window.scipaper.createArticle(payload)
      setSelectedArticleId(nextState.articles[0]?.id ?? null)
      setActiveTab('Introduction')
      setWizardOpen(false)
      return nextState
    }, '已创建新论文项目')
  }

  async function handleCreateThesis(payload: CreateThesisPayload) {
    await mutate(async () => {
      const nextState = await window.scipaper.createThesis(payload)
      setActiveThesisId(nextState.theses[0]?.id ?? null)
      setThesisWizardOpen(false)
      return nextState
    }, '已创建新学位论文')
  }

  async function saveMeta() {
    if (!selectedArticle) {
      return
    }

    await mutate(
      () => window.scipaper.updateArticleMeta(selectedArticle.id, metaDraft),
      '论文基础信息已保存',
    )
  }

  const activeSection =
    selectedArticle && !['ResearchContext', 'Review', 'Mcp', 'Search', 'Stats'].includes(activeTab)
      ? selectedArticle.sections.find((section) => section.type === activeTab)
      : null

  return (
    <>
      <ArticleWizard busy={busy} onClose={() => setWizardOpen(false)} onSubmit={handleCreateArticle} open={wizardOpen} />
      <ThesisWizard busy={busy} onClose={() => setThesisWizardOpen(false)} onSubmit={handleCreateThesis} open={thesisWizardOpen} />

      <div className="app-shell">
        <aside className="library-panel">
          <div className="brand-block">
            <h1>{greeting}</h1>
            <p className="brand-question">今天想先整理哪篇稿子？</p>
            <p>本地优先，支持 MCP 实时写入、附件备份和论文进度管理。</p>
          </div>

          <button className="primary-button full-width" onClick={() => setWizardOpen(true)} type="button">
            新建文章
          </button>

          <label className="field compact">
            <span>搜索论文</span>
            <input placeholder="标题 / 期刊 / 科学问题" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>

          <div className="sidebar-actions">
            <button 
              className="ghost-button full-width" 
              onClick={() => setActiveTab('Search')}
              type="button"
            >
              🔍 全文搜索
            </button>
            <button 
              className="ghost-button full-width" 
              onClick={() => setActiveTab('Stats')}
              type="button"
            >
              📊 写作统计
            </button>
          </div>

          <div className="article-list">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                className={`article-tile ${selectedArticleId === article.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedArticleId(article.id)
                  if (activeTab === 'Mcp') {
                    setActiveTab('Introduction')
                  }
                }}
                type="button"
              >
                <div>
                  <strong>{article.title}</strong>
                  <p>{article.targetJournal || '未设置目标期刊'}</p>
                </div>
                <div className="tile-meta">
                  <span className="status-pill">{formatStatus(article.status)}</span>
                  <span>{new Date(article.updatedAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="sidebar-footnote">
            <p>本地目录</p>
            <strong>{state?.baseDirectory ?? '载入中...'}</strong>
          </div>
        </aside>

        <main className="workspace">
          {notice ? <div className="notice-banner">{notice}</div> : null}

          {selectedArticle ? (
            <>
              <header className="workspace-top">
                <div className="meta-heading">
                  <p className="eyebrow">Manuscript Dashboard</p>
                  <h2>{selectedArticle.title}</h2>
                </div>

                <div className="meta-grid">
                  <label className="field compact">
                    <span>文章标题</span>
                    <input value={metaDraft.title} onChange={(event) => setMetaDraft({ ...metaDraft, title: event.target.value })} />
                  </label>
                  <label className="field compact">
                    <span>目标期刊</span>
                    <input
                      value={metaDraft.targetJournal}
                      onChange={(event) => setMetaDraft({ ...metaDraft, targetJournal: event.target.value })}
                    />
                  </label>
                  <label className="field compact">
                    <span>当前状态</span>
                    <select
                      value={metaDraft.status}
                      onChange={(event) => setMetaDraft({ ...metaDraft, status: event.target.value as ArticleStatus })}
                    >
                      {(['Drafting', 'Submitted', 'UnderReview', 'Revision', 'Resubmitted', 'Accepted', 'Rejected', 'Published'] as const).map(
                        (status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                <div className="header-actions">
                  <button className="ghost-button" onClick={() => window.scipaper.exportMarkdown(selectedArticle.id)} type="button">
                    导出 Markdown
                  </button>
                  <button className="primary-button" disabled={busy} onClick={saveMeta} type="button">
                    保存信息
                  </button>
                </div>
              </header>

              <div className="workspace-grid">
                <nav className="section-nav">
                  <div className="nav-group">
                    {selectedArticle.sections.map((section) => (
                      <button
                        key={section.id}
                        className={`nav-chip ${activeTab === section.type ? 'active' : ''}`}
                        onClick={() => setActiveTab(section.type)}
                        type="button"
                      >
                        <span>{SECTION_LABELS[section.type]}</span>
                        <em>{section.contentBlocks.length}</em>
                      </button>
                    ))}
                  </div>

                  <div className="nav-divider" />

                  <button
                    className={`nav-chip utility ${activeTab === 'ResearchContext' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ResearchContext')}
                    type="button"
                  >
                    研究上下文
                  </button>
                  <button
                    className={`nav-chip utility ${activeTab === 'Review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Review')}
                    type="button"
                  >
                    审稿管理
                  </button>
                  <button
                    className={`nav-chip utility ${activeTab === 'Mcp' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Mcp')}
                    type="button"
                  >
                    MCP 配置
                  </button>
                </nav>

                <section className="content-stage">
                  {activeSection ? (
                    <SectionEditor
                      article={selectedArticle}
                      section={activeSection}
                      onAddFile={() =>
                        mutate(
                          () => window.scipaper.importAssetBlock(selectedArticle.id, activeSection.type, 'file'),
                          '已导入并备份文件',
                        )
                      }
                      onAddImage={() =>
                        mutate(
                          () => window.scipaper.importAssetBlock(selectedArticle.id, activeSection.type, 'image'),
                          '已添加图片附件',
                        )
                      }
                      onAddText={(content, description) =>
                        mutate(
                          () => window.scipaper.addTextBlock(selectedArticle.id, activeSection.type, content, description),
                          '文本块已添加',
                        )
                      }
                      onDeleteBlock={(blockId) =>
                        mutate(() => window.scipaper.deleteBlock(selectedArticle.id, blockId), '内容块已删除')
                      }
                      onOpenAsset={async (blockId) => {
                        await window.scipaper.openBlockAsset(selectedArticle.id, blockId)
                      }}
                      onUpdateBlock={(blockId, content, description) =>
                        mutate(
                          () => window.scipaper.updateTextBlock(selectedArticle.id, blockId, content, description),
                          '文本块已更新',
                        )
                      }
                    />
                  ) : null}

                  {activeTab === 'ResearchContext' ? (
                    <ResearchContextPanel
                      article={selectedArticle}
                      onSave={(researchContext) =>
                        mutate(
                          () => window.scipaper.updateResearchContext(selectedArticle.id, researchContext),
                          '研究上下文已保存',
                        )
                      }
                    />
                  ) : null}

                  {activeTab === 'Review' ? (
                    <ReviewPanel
                      article={selectedArticle}
                      onAddComment={(roundId, payload) =>
                        mutate(() => window.scipaper.addReviewComment(selectedArticle.id, roundId, payload), '审稿意见已保存')
                      }
                      onAddRevision={(roundId, commentId, payload) =>
                        mutate(
                          () => window.scipaper.addRevision(selectedArticle.id, roundId, commentId, payload),
                          '修改记录已保存',
                        )
                      }
                      onAddRound={(payload) =>
                        mutate(() => window.scipaper.addReviewRound(selectedArticle.id, payload), '投稿轮次已创建')
                      }
                      onUpdateStatus={(roundId, commentId, status) =>
                        mutate(
                          () => window.scipaper.updateReviewCommentStatus(selectedArticle.id, roundId, commentId, status),
                          '审稿状态已更新',
                        )
                      }
                    />
                  ) : null}

                  {activeTab === 'Mcp' ? <McpPanel info={mcpInfo} /> : null}

                  {activeTab === 'Search' ? (
                    <SearchPanel
                      articles={state?.articles ?? []}
                      theses={state?.theses ?? []}
                      onSelectResult={(result: SearchResult) => {
                        if (result.type === 'article') {
                          const article = state?.articles.find(a => a.id === result.id)
                          if (article) {
                            setSelectedArticleId(article.id)
                            setActiveTab('Introduction')
                          }
                        } else if (result.type === 'thesis') {
                          const thesis = state?.theses.find(t => t.id === result.id)
                          if (thesis) {
                            setActiveThesisId(thesis.id)
                          }
                        }
                      }}
                    />
                  ) : null}

                  {activeTab === 'Stats' ? (
                    <div className="panel-stack">
                      <WordCountStats stats={getWordCountStats(state?.articles ?? [], state?.theses ?? [], new Date().toISOString().split('T')[0])} />
                      <WritingStreak 
                        streak={state?.writingStreak ?? { currentStreak: 0, longestStreak: 0, totalWritingDays: 0, todayWords: 0, dailyGoal: 500, lastWriteDate: '', streakHistory: [] }} 
                        onUpdateGoal={async (goal) => {
                          await mutate(() => window.scipaper.updateDailyGoal(goal))
                        }}
                      />
                    </div>
                  ) : null}
                </section>
              </div>
            </>
          ) : (
            <section className="empty-state">
              <p className="eyebrow">SciPaper Todo</p>
              <h2>{greeting}</h2>
              <p>从一篇新稿子开始。创建后会自动生成 IMRaD 七章节骨架和研究上下文。</p>
              <button className="primary-button" onClick={() => setWizardOpen(true)} type="button">
                现在开始
              </button>
            </section>
          )}
        </main>
      </div>
    </>
  )
}

export default App
