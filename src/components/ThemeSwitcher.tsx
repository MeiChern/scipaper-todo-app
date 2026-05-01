import type { ThemeType } from '../types'

interface ThemeSwitcherProps {
  currentTheme: ThemeType
  onThemeChange: (theme: ThemeType) => Promise<void>
}

interface ThemeOption {
  type: ThemeType
  label: string
  caption: string
  swatch: string[]
  preview: 'soft' | 'pixel' | 'leaf'
}

const THEMES: ThemeOption[] = [
  {
    type: 'claude',
    label: 'Claude',
    caption: '温润珊瑚 · 学术纸感',
    swatch: ['#F0EEE6', '#FFFFFF', '#D97757'],
    preview: 'soft',
  },
  {
    type: 'pixel',
    label: 'Pixel',
    caption: '黑白极客 · 像素硬朗',
    swatch: ['#FFFFFF', '#000000', '#000000'],
    preview: 'pixel',
  },
  {
    type: 'fresh',
    label: 'Fresh',
    caption: '清新薄荷 · 护眼养目',
    swatch: ['#F1F8F4', '#FFFFFF', '#2E8B57'],
    preview: 'leaf',
  },
]

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <section className="panel-card theme-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Theme</p>
          <h3>主题切换</h3>
        </div>
      </div>

      <div className="theme-grid">
        {THEMES.map(theme => {
          const selected = currentTheme === theme.type
          return (
            <button
              key={theme.type}
              className={`theme-button ${selected ? 'selected' : ''}`}
              onClick={() => onThemeChange(theme.type)}
              type="button"
              aria-pressed={selected}
            >
              <div className={`theme-preview preview-${theme.preview}`}>
                <span className="theme-swatches" aria-hidden="true">
                  {theme.swatch.map((color, idx) => (
                    <span key={idx} className="theme-swatch" style={{ background: color }} />
                  ))}
                </span>
                <span className="theme-meta">
                  <span className="theme-label">{theme.label}</span>
                  <span className="theme-caption">{theme.caption}</span>
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
