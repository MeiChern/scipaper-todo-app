import { useState } from 'react'
import type { Tag, TagColor } from '../types'
import { TAG_COLORS } from '../types'

interface TagManagerProps {
  tags: Tag[]
  onAddTag: (name: string, color: TagColor) => Promise<void>
  onRemoveTag: (tagId: string) => Promise<void>
}

export function TagManager({ tags, onAddTag, onRemoveTag }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState<TagColor>(TAG_COLORS[0])
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleAddTag() {
    if (!newTagName.trim()) return
    await onAddTag(newTagName.trim(), selectedColor)
    setNewTagName('')
    setShowAddForm(false)
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Tags</p>
          <h3>标签管理</h3>
        </div>
        <button 
          className="ghost-button" 
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
        >
          {showAddForm ? '取消' : '添加标签'}
        </button>
      </div>

      {showAddForm && (
        <div className="tag-form">
          <label className="field">
            <span>标签名称</span>
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="输入标签名称..."
            />
          </label>
          
          <div className="color-picker">
            <span>选择颜色</span>
            <div className="color-options">
              {TAG_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  type="button"
                />
              ))}
            </div>
          </div>

          <button className="primary-button" onClick={handleAddTag} type="button">
            添加
          </button>
        </div>
      )}

      <div className="tag-manager-list">
        {tags.length === 0 ? (
          <p className="empty-text">暂无标签</p>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="tag-item">
              <span 
                className="tag-badge"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
              <button 
                className="tag-remove"
                onClick={() => onRemoveTag(tag.id)}
                type="button"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
