import { useState } from 'react'
import type { Article } from '../types'

interface SharePanelProps {
  article: Article
  onCreateSharePackage: () => Promise<void>
}

export function SharePanel({ article, onCreateSharePackage }: SharePanelProps) {
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate() {
    setIsCreating(true)
    try {
      await onCreateSharePackage()
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Share</p>
          <h3>分享文章</h3>
        </div>
      </div>

      <div className="share-info">
        <p>创建一个包含所有数据和附件的分享包，可以直接发送给他人导入。</p>
      </div>

      <div className="share-preview">
        <div className="share-item">
          <span className="share-icon">📄</span>
          <span>article.json - 文章数据</span>
        </div>
        <div className="share-item">
          <span className="share-icon">📁</span>
          <span>Attachments/ - 附件目录</span>
        </div>
        <div className="share-item">
          <span className="share-icon">📝</span>
          <span>README.md - 说明文件</span>
        </div>
      </div>

      <button 
        className="primary-button full-width" 
        onClick={handleCreate}
        disabled={isCreating}
        type="button"
      >
        {isCreating ? '创建中...' : '创建分享包'}
      </button>
    </section>
  )
}
