import { useState } from 'react'
import type { ContentBlockVersion } from '../types'

interface DiffViewerProps {
  versions: ContentBlockVersion[]
  currentContent: string
}

export function DiffViewer({ versions, currentContent }: DiffViewerProps) {
  const [selectedVersion, setSelectedVersion] = useState<ContentBlockVersion | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  function computeDiff(oldText: string, newText: string) {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    const diff: { type: 'added' | 'removed' | 'unchanged'; content: string }[] = []

    let oldIndex = 0
    let newIndex = 0

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex >= oldLines.length) {
        diff.push({ type: 'added', content: newLines[newIndex] })
        newIndex++
      } else if (newIndex >= newLines.length) {
        diff.push({ type: 'removed', content: oldLines[oldIndex] })
        oldIndex++
      } else if (oldLines[oldIndex] === newLines[newIndex]) {
        diff.push({ type: 'unchanged', content: oldLines[oldIndex] })
        oldIndex++
        newIndex++
      } else {
        diff.push({ type: 'removed', content: oldLines[oldIndex] })
        diff.push({ type: 'added', content: newLines[newIndex] })
        oldIndex++
        newIndex++
      }
    }

    return diff
  }

  const diff = selectedVersion ? computeDiff(selectedVersion.content, currentContent) : []

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Version History</p>
          <h3>版本对比</h3>
        </div>
        {selectedVersion && (
          <button 
            className="ghost-button" 
            onClick={() => setShowDiff(!showDiff)}
            type="button"
          >
            {showDiff ? '隐藏差异' : '显示差异'}
          </button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="empty-panel">
          <p>暂无历史版本</p>
        </div>
      ) : (
        <>
          <div className="version-list">
            {versions.slice(0, 5).map((version, index) => (
              <div 
                key={version.id} 
                className={`version-item ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedVersion(version)
                  setShowDiff(true)
                }}
              >
                <div className="version-header">
                  <span className="version-author">{version.modifiedBy}</span>
                  <span className="version-date">
                    {new Date(version.modifiedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="version-description">{version.changeDescription || '未填写变更说明'}</p>
              </div>
            ))}
          </div>

          {showDiff && selectedVersion && (
            <div className="diff-view">
              <p className="eyebrow">差异对比</p>
              <div className="diff-content">
                {diff.map((line, index) => (
                  <div key={index} className={`diff-line diff-${line.type}`}>
                    <span className="diff-indicator">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="diff-text">{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}