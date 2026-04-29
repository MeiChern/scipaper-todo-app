import type { ThemeType } from '../types'

interface ThemeSwitcherProps {
  currentTheme: ThemeType
  onThemeChange: (theme: ThemeType) => Promise<void>
}

const THEMES: { type: ThemeType; label: string; emoji: string; colors: { bg: string; text: string } }[] = [
  { type: 'light', label: '浅色', emoji: '☀️', colors: { bg: '#f8f0e3', text: '#43362b' } },
  { type: 'dark', label: '深色', emoji: '🌙', colors: { bg: '#1a1a1a', text: '#e0e0e0' } },
  { type: 'sepia', label: '护眼', emoji: '📜', colors: { bg: '#f5e6d3', text: '#5b4636' } },
  { type: 'green', label: '清新', emoji: '🌿', colors: { bg: '#e8f5e9', text: '#2e7d32' } },
]

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Theme</p>
          <h3>主题切换</h3>
        </div>
      </div>

      <div className="theme-grid">
        {THEMES.map(theme => (
          <button
            key={theme.type}
            className={`theme-button ${currentTheme === theme.type ? 'selected' : ''}`}
            onClick={() => onThemeChange(theme.type)}
            type="button"
          >
            <div
              className="theme-preview"
              style={{
                background: theme.colors.bg,
                color: theme.colors.text,
                border: `2px solid ${currentTheme === theme.type ? 'var(--accent)' : 'var(--line)'}`
              }}
            >
              <span className="theme-emoji">{theme.emoji}</span>
              <span className="theme-label">{theme.label}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
