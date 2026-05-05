import { useEffect, useState, type JSX } from 'react'
import type {
  AppState,
  McpInfo,
  ThemeType,
  LlmProvider,
  LlmPreset,
  WritingScenario,
  ItalicGuide,
  ZoteroConfig,
  WritingStats as WritingStatsType,
} from '../types'
import { WritingStats } from './WritingStats'
import { ThemeSwitcher } from './ThemeSwitcher'
import { McpPanel } from './McpPanel'
import { ProviderManager } from './ProviderManager'
import { ScenarioLibrary } from './ScenarioLibrary'
import { ItalicGuidePanel } from './ItalicGuidePanel'
import { ZoteroConfigPanel } from './ZoteroConfigPanel'

interface SettingsViewProps {
  state: AppState
  theme: ThemeType
  onThemeChange: (theme: ThemeType) => Promise<void>
  mcpInfo: McpInfo | null
  providers: LlmProvider[]
  activeProviderId: string | null
  presets: LlmPreset[]
  onAddProvider: (draft: Omit<LlmProvider, 'id' | 'hasApiKey'> & { apiKey: string }) => Promise<void>
  onUpdateProvider: (
    id: string,
    patch: Partial<Omit<LlmProvider, 'id' | 'hasApiKey'>> & { apiKey?: string },
  ) => Promise<void>
  onDeleteProvider: (id: string) => Promise<void>
  onSetActiveProvider: (id: string) => Promise<void>
  onTestProvider: (id: string) => Promise<{ ok: boolean; message: string }>
  scenarios: WritingScenario[]
  onAddScenario: (draft: Omit<WritingScenario, 'id' | 'builtin'>) => Promise<void>
  onUpdateScenario: (id: string, patch: Partial<Omit<WritingScenario, 'id' | 'builtin'>>) => Promise<void>
  onDeleteScenario: (id: string) => Promise<void>
  onResetScenario: (id: string) => Promise<void>
  italicGuide: ItalicGuide
  onUpdateItalicGuide: (next: ItalicGuide) => Promise<void>
  zoteroConfig: ZoteroConfig
  onUpdateZoteroConfig: (next: ZoteroConfig) => Promise<void>
  writingStats: WritingStatsType | null
  autoApproveTools: boolean
  onSetAutoApproveTools: (value: boolean) => Promise<void>
  initialFocus?: SettingsModule | null
  onFocusConsumed?: () => void
}

export type SettingsModule = 'theme' | 'storage' | 'ai' | 'scenarios' | 'italic' | 'zotero' | 'mcp' | 'stats' | 'autoApprove'

const MODULE_LABEL: Record<SettingsModule, string> = {
  theme: '主题',
  storage: '本地数据目录',
  ai: 'AI Provider',
  scenarios: '写作场景库',
  italic: '拉丁斜体规范',
  zotero: 'Zotero 接入',
  mcp: 'MCP 接入',
  stats: '写作统计',
  autoApprove: 'AI 自动批准',
}

export function SettingsView(props: SettingsViewProps): JSX.Element {
  const [active, setActive] = useState<SettingsModule | null>(null)

  useEffect(() => {
    if (props.initialFocus) {
      setActive(props.initialFocus)
      props.onFocusConsumed?.()
    }
  }, [props.initialFocus])

  if (active) {
    return (
      <div className="workspace settings-view">
        <header className="workspace-top">
          <button className="module-back" onClick={() => setActive(null)} type="button">
            ← 返回 Settings
          </button>
          <div className="meta-heading">
            <p className="eyebrow">Settings</p>
            <h2>{MODULE_LABEL[active]}</h2>
          </div>
        </header>

        <section className="panel-stack">
          {active === 'theme' && (
            <ThemeSwitcher currentTheme={props.theme} onThemeChange={props.onThemeChange} />
          )}

          {active === 'storage' && (
            <section className="panel-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Storage</p>
                  <h3>本地数据目录</h3>
                </div>
              </div>
              <div className="plain-list">
                <p>当前目录:</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', wordBreak: 'break-all' }}>
                  {props.state.baseDirectory || '载入中...'}
                </p>
                <p className="muted-text">
                  所有稿件、附件、引文都存在这个目录里。MCP 写入也走这里。
                </p>
              </div>
            </section>
          )}

          {active === 'ai' && (
            <ProviderManager
              providers={props.providers}
              activeId={props.activeProviderId}
              presets={props.presets}
              onAdd={props.onAddProvider}
              onUpdate={props.onUpdateProvider}
              onDelete={props.onDeleteProvider}
              onSetActive={props.onSetActiveProvider}
              onTest={props.onTestProvider}
            />
          )}

          {active === 'scenarios' && (
            <ScenarioLibrary
              scenarios={props.scenarios}
              onAdd={props.onAddScenario}
              onUpdate={props.onUpdateScenario}
              onDelete={props.onDeleteScenario}
              onResetToDefault={props.onResetScenario}
            />
          )}

          {active === 'italic' && (
            <ItalicGuidePanel
              config={props.italicGuide}
              onUpdate={props.onUpdateItalicGuide}
            />
          )}

          {active === 'zotero' && (
            <ZoteroConfigPanel
              config={props.zoteroConfig}
              onUpdate={props.onUpdateZoteroConfig}
            />
          )}

          {active === 'mcp' && <McpPanel info={props.mcpInfo} />}

          {active === 'stats' && props.writingStats && <WritingStats stats={props.writingStats} />}

          {active === 'autoApprove' && (
            <section className="panel-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">AI safety</p>
                  <h3>自动批准工具调用</h3>
                </div>
              </div>
              <div className="plain-list">
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={props.autoApproveTools}
                    onChange={(e) => props.onSetAutoApproveTools(e.target.checked)}
                  />
                  <span>开启后，内置 AI 调用任何写入类工具（创建文章、改正文、记心情、导出 ...）都不再弹批准对话框，直接执行。</span>
                </label>
                <p className="muted-text">
                  ⚠️ 关闭是默认值。开启意味着把决策权完全交给 AI，请只在自己稳定可控的工作流里使用。
                  外部 MCP 客户端（Claude Code / Cursor）的批准是它们自己的事，跟这个开关无关。
                </p>
                <p className="muted-text" style={{ marginTop: 'var(--sp-2)' }}>
                  当前状态：<strong>{props.autoApproveTools ? '已开启（自动批准）' : '已关闭（每次确认）'}</strong>
                </p>
              </div>
            </section>
          )}
        </section>
      </div>
    )
  }

  const activeProvider = props.providers.find((p) => p.id === props.activeProviderId)
  const aiStatus = activeProvider
    ? `${activeProvider.name} · ${activeProvider.hasApiKey ? '已配置' : '缺 API Key'}`
    : `${props.providers.length} 个未启用`

  return (
    <div className="workspace settings-view">
      <header className="workspace-top">
        <div className="meta-heading">
          <p className="eyebrow">Settings</p>
          <h2>偏好设置</h2>
          <p className="muted-text">点击任一模块进入详情。</p>
        </div>
      </header>

      <div className="module-grid">
        <button className="module-card" onClick={() => setActive('theme')} type="button">
          <span className="module-card-icon">◐</span>
          <h3 className="module-card-title">主题</h3>
          <p className="module-card-desc">三套界面外观</p>
          <p className="module-card-status">当前: {props.theme}</p>
        </button>

        <button className="module-card" onClick={() => setActive('storage')} type="button">
          <span className="module-card-icon">▤</span>
          <h3 className="module-card-title">本地数据目录</h3>
          <p className="module-card-desc">查看稿件文件存放位置</p>
          <p className="module-card-status">{props.state.baseDirectory ? '已就绪' : '载入中'}</p>
        </button>

        <button className="module-card" onClick={() => setActive('ai')} type="button">
          <span className="module-card-icon">✱</span>
          <h3 className="module-card-title">AI Provider</h3>
          <p className="module-card-desc">外接 LLM (DeepSeek 等)</p>
          <p className="module-card-status">{aiStatus}</p>
        </button>

        <button className="module-card" onClick={() => setActive('scenarios')} type="button">
          <span className="module-card-icon">✎</span>
          <h3 className="module-card-title">写作场景库</h3>
          <p className="module-card-desc">地学内置场景 + 自定义,Chat 自动注入</p>
          <p className="module-card-status">
            {props.scenarios.filter((s) => s.enabled).length} 个启用 / {props.scenarios.length} 个总数
          </p>
        </button>

        <button className="module-card" onClick={() => setActive('italic')} type="button">
          <span className="module-card-icon">𝐼</span>
          <h3 className="module-card-title">拉丁斜体规范</h3>
          <p className="module-card-desc">拉丁短语 / 统计符号 / 模型变量自动斜体</p>
          <p className="module-card-status">{props.italicGuide.enabled ? '已启用' : '未启用'}</p>
        </button>

        <button className="module-card" onClick={() => setActive('zotero')} type="button">
          <span className="module-card-icon">𝒁</span>
          <h3 className="module-card-title">Zotero 接入</h3>
          <p className="module-card-desc">直连本地 Zotero 6/7,搜索引文与笔记</p>
          <p className="module-card-status">
            {props.zoteroConfig.enabled ? '已启用' : '未启用'} · {props.zoteroConfig.endpoint}
          </p>
        </button>

        <button className="module-card" onClick={() => setActive('mcp')} type="button">
          <span className="module-card-icon">⌘</span>
          <h3 className="module-card-title">MCP 接入</h3>
          <p className="module-card-desc">让 Claude Code/Cursor 连接此 app</p>
          <p className="module-card-status">{props.mcpInfo ? '已就绪' : '载入中'}</p>
        </button>

        <button className="module-card" onClick={() => setActive('stats')} type="button">
          <span className="module-card-icon">▤</span>
          <h3 className="module-card-title">写作统计</h3>
          <p className="module-card-desc">字数总览、章节分布、词频</p>
          <p className="module-card-status">
            {props.writingStats?.totalArticles ?? 0} 篇 · {props.writingStats?.totalWords?.toLocaleString() ?? 0} 字
          </p>
        </button>

        <button className="module-card" onClick={() => setActive('autoApprove')} type="button">
          <span className="module-card-icon">✓</span>
          <h3 className="module-card-title">AI 自动批准</h3>
          <p className="module-card-desc">内置 AI 写入工具的批准开关</p>
          <p className="module-card-status">{props.autoApproveTools ? '自动批准（开）' : '每次确认（默认）'}</p>
        </button>
      </div>
    </div>
  )
}
