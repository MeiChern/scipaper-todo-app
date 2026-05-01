import type { JSX } from 'react'

export type AppRoute = 'home' | 'library' | 'article' | 'settings' | 'daily'

interface AppSidebarProps {
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  onNewArticle: () => void
  onNewThesis: () => void
  onOpenAi: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  todayWords: number
  dailyGoal: number
  hasOpenArticle: boolean
  openArticleTitle?: string | null
}

function aiShortcutLabel(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || '')) {
    return '⌘K'
  }
  return 'Ctrl K'
}

function navClass(route: AppRoute, current: AppRoute) {
  return route === current ? 'home-nav-item is-active' : 'home-nav-item'
}

export function AppSidebar({
  route,
  onNavigate,
  onNewArticle,
  onNewThesis,
  onOpenAi,
  searchValue,
  onSearchChange,
  todayWords,
  dailyGoal,
  hasOpenArticle,
  openArticleTitle,
}: AppSidebarProps): JSX.Element {
  return (
    <aside className='home-sidebar'>
      <div className='home-brand'>
        <div className='home-brand-glyph'>P</div>
        <div className='home-brand-name'>papertodo</div>
      </div>

      {route === 'library' ? (
        <input
          className='sidebar-search'
          type='search'
          placeholder='在 Library 中筛选稿件…'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      ) : null}

      <nav>
        <p className='home-section-label'>Workspace</p>
        <ul className='home-nav'>
          <li
            className={navClass(route, 'home')}
            onClick={() => onNavigate('home')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            role='button'
            tabIndex={0}
          >
            <span className='home-nav-icon'>◐</span>Home
          </li>
          <li
            className={navClass(route, 'library')}
            onClick={() => onNavigate('library')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('library')}
            role='button'
            tabIndex={0}
          >
            <span className='home-nav-icon'>▤</span>Library
          </li>
          <li
            className={`${navClass(route, 'article')}${!hasOpenArticle ? ' is-disabled' : ''}`}
            onClick={() => hasOpenArticle && onNavigate('article')}
            onKeyDown={(e) => e.key === 'Enter' && hasOpenArticle && onNavigate('article')}
            role='button'
            tabIndex={hasOpenArticle ? 0 : -1}
            aria-disabled={!hasOpenArticle}
          >
            <span className='home-nav-icon'>✎</span>
            Article
            {hasOpenArticle && openArticleTitle ? (
              <span className='home-nav-aside'>{openArticleTitle.slice(0, 14)}</span>
            ) : null}
          </li>
        </ul>

        <p className='home-section-label' style={{ marginTop: 'var(--sp-5)' }}>Tools</p>
        <ul className='home-nav'>
          <li
            className={navClass(route, 'daily')}
            onClick={() => onNavigate('daily')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('daily')}
            role='button'
            tabIndex={0}
          >
            <span className='home-nav-icon'>☉</span>Daily Log
          </li>
          <li
            className={navClass(route, 'settings')}
            onClick={() => onNavigate('settings')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('settings')}
            role='button'
            tabIndex={0}
          >
            <span className='home-nav-icon'>⚙</span>Settings
          </li>
          <li
            className='home-nav-item'
            onClick={onOpenAi}
            onKeyDown={(e) => e.key === 'Enter' && onOpenAi()}
            role='button'
            tabIndex={0}
          >
            <span className='home-nav-icon'>✦</span>
            AI 助手
            <span className='home-nav-aside'>{aiShortcutLabel()}</span>
          </li>
        </ul>

        <p className='home-section-label' style={{ marginTop: 'var(--sp-5)' }}>Create</p>
        <div className='sidebar-create'>
          <button className='ghost-button full-width' onClick={onNewArticle} type='button'>
            + 新建文章
          </button>
          <button className='ghost-button full-width' onClick={onNewThesis} type='button'>
            + 新建学位论文
          </button>
        </div>
      </nav>

      <div className='home-mini-card sidebar-progress'>
        <span className='sidebar-progress-line'>
          <span className='sidebar-progress-num'>{todayWords.toLocaleString()}</span>
          <span className='sidebar-progress-goal'> / {dailyGoal.toLocaleString()} 字</span>
        </span>
        <span className='home-mini-card-label'>今日写作进度</span>
        <div className='sidebar-progress-bar'>
          <div
            className='sidebar-progress-fill'
            style={{
              width: `${dailyGoal > 0 ? Math.min(100, Math.round((todayWords / dailyGoal) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>
    </aside>
  )
}
