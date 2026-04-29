import type { Article } from '../types'

interface ExportPanelProps {
  article: Article
  onExportMarkdown: () => Promise<void>
  onExportHTML: () => Promise<void>
  onExportJSON: () => Promise<void>
  onCreateSharePackage: () => Promise<void>
}

export function ExportPanel({ onExportMarkdown, onExportHTML, onExportJSON, onCreateSharePackage }: ExportPanelProps) {
  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Export</p>
          <h3>导出文章</h3>
        </div>
      </div>

      <div className="export-options">
        <div className="export-option">
          <div className="export-info">
            <strong>Markdown</strong>
            <p>导出为 .md 文件，适合在其他编辑器中使用</p>
          </div>
          <button className="ghost-button" onClick={onExportMarkdown} type="button">
            导出
          </button>
        </div>

        <div className="export-option">
          <div className="export-info">
            <strong>HTML</strong>
            <p>导出为 .html 文件，可在浏览器中查看</p>
          </div>
          <button className="ghost-button" onClick={onExportHTML} type="button">
            导出
          </button>
        </div>

        <div className="export-option">
          <div className="export-info">
            <strong>JSON</strong>
            <p>导出完整数据备份，可用于恢复或迁移</p>
          </div>
          <button className="ghost-button" onClick={onExportJSON} type="button">
            导出
          </button>
        </div>

        <div className="export-option">
          <div className="export-info">
            <strong>分享包</strong>
            <p>创建包含附件的分享目录，可直接发送给他人</p>
          </div>
          <button className="primary-button" onClick={onCreateSharePackage} type="button">
            创建
          </button>
        </div>
      </div>
    </section>
  )
}
