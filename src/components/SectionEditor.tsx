import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import UTIF from 'utif'
import { DiffViewer } from './DiffViewer'
import type { Article, BlockPreview, ContentBlock, Section } from '../types'

interface SectionEditorProps {
  article: Article
  section: Section
  onAddText: (content: string, description?: string) => Promise<void>
  onUpdateBlock: (blockId: string, content: string, description?: string) => Promise<void>
  onDeleteBlock: (blockId: string) => Promise<void>
  onAddImage: () => Promise<void>
  onAddFile: () => Promise<void>
  onOpenAsset: (blockId: string) => Promise<void>
}

function formatFileSize(size?: number | null) {
  if (!size) {
    return '未知大小'
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getPreviewSummary(block: ContentBlock) {
  const text = block.content.replace(/\s+/g, ' ').trim()
  return text.length > 240 ? `${text.slice(0, 240)}...` : text
}

function buildTiffPreview(bufferBase64: string) {
  const binary = atob(bufferBase64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  const ifds = UTIF.decode(bytes.buffer)

  if (!ifds.length) {
    return null
  }

  UTIF.decodeImage(bytes.buffer, ifds[0])
  const rgba = UTIF.toRGBA8(ifds[0])
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  canvas.width = ifds[0].width
  canvas.height = ifds[0].height
  const imageData = new ImageData(new Uint8ClampedArray(rgba), canvas.width, canvas.height)
  context.putImageData(imageData, 0, 0)

  return canvas.toDataURL('image/png')
}

function buildBlobUrl(bufferBase64: string, mimeType: string) {
  const binary = atob(bufferBase64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

function TextBlockModal({
  block,
  onClose,
  onSave,
  onDelete,
}: {
  block: ContentBlock
  onClose: () => void
  onSave: (content: string, description: string) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [content, setContent] = useState(block.content)
  const [description, setDescription] = useState(block.description)

  useEffect(() => {
    setContent(block.content)
    setDescription(block.description)
  }, [block.id, block.content, block.description])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card wide-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">文本块</p>
            <h2>大窗口编辑</h2>
            <p className="modal-subtitle">
              来源 {block.updatedBy || block.createdBy || '未知'} · 最近更新 {formatDate(block.updatedAt)}
            </p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <div className="modal-grid">
          <div className="panel-card">
            <label className="field">
              <span>备注</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="为这段文字加一个容易识别的标签" />
            </label>
            <label className="field">
              <span>正文</span>
              <textarea className="block-textarea large-textarea" rows={18} value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
          </div>

          <aside className="panel-card history-panel">
            <p className="eyebrow">写入来源</p>
            <h3>最近版本</h3>
            <div className="revision-list">
              {block.versions.slice(0, 6).map((version) => (
                <div key={version.id} className="revision-item">
                  <strong>{version.modifiedBy}</strong>
                  <p>{version.changeDescription || '未填写变更说明'}</p>
                  <span>{formatDate(version.modifiedAt)}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="modal-footer">
          <button className="ghost-button" onClick={onDelete} type="button">
            删除文本块
          </button>
          <button className="primary-button" onClick={() => onSave(content, description)} type="button">
            保存修改
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function AssetPreviewModal({
  block,
  preview,
  error,
  onClose,
  onOpenAsset,
}: {
  block: ContentBlock
  preview: BlockPreview | null
  error: string
  onClose: () => void
  onOpenAsset: () => Promise<void>
}) {
  const [tiffDataUrl, setTiffDataUrl] = useState<string | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (preview?.previewKind === 'tiff' && preview.bufferBase64) {
      setTiffDataUrl(buildTiffPreview(preview.bufferBase64))
    } else {
      setTiffDataUrl(null)
    }
  }, [preview])

  useEffect(() => {
    if (preview?.previewKind !== 'pdf' || !preview.bufferBase64) {
      setPdfBlobUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }
        return null
      })
      return
    }

    const nextUrl = buildBlobUrl(preview.bufferBase64, 'application/pdf')
    setPdfBlobUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
      return nextUrl
    })

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [preview])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useLayoutEffect(() => {
    backdropRef.current?.scrollTo({ top: 0, left: 0 })
    modalRef.current?.scrollTo({ top: 0, left: 0 })
  }, [block.id, preview?.path, preview?.previewKind, pdfBlobUrl, error])

  const pdfViewerUrl = pdfBlobUrl ? `${pdfBlobUrl}#page=1&view=FitH` : null

  return createPortal(
    <div className="modal-backdrop" ref={backdropRef} role="presentation">
      <div className="modal-card wide-modal preview-modal" ref={modalRef}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">附件预览</p>
            <h2>{preview?.fileName || block.fileName || '未命名附件'}</h2>
            <p className="modal-subtitle">
              来源 {block.updatedBy || block.createdBy || '未知'} · 更新于 {formatDate(block.updatedAt)}
            </p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <div className="preview-stage">
          {!preview && !error ? (
            <div className="empty-panel">
              <h3>正在准备预览</h3>
              <p>正在读取附件内容，请稍候。</p>
            </div>
          ) : null}
          {error ? (
            <div className="empty-panel">
              <h3>预览失败</h3>
              <p>{error}</p>
            </div>
          ) : null}
          {preview?.previewKind === 'image' ? (
            <img className="preview-image" src={block.previewUrl || ''} alt={block.fileName || block.description || '附件预览'} />
          ) : null}
          {preview?.previewKind === 'pdf' && pdfViewerUrl ? (
            <iframe className="preview-frame" key={pdfViewerUrl} src={pdfViewerUrl} title={preview.fileName} />
          ) : null}
          {preview?.previewKind === 'tiff' && tiffDataUrl ? (
            <img className="preview-image" src={tiffDataUrl} alt={preview.fileName} />
          ) : null}
          {!error &&
          (preview?.previewKind === 'none' ||
            (!tiffDataUrl && preview?.previewKind === 'tiff') ||
            (!pdfBlobUrl && preview?.previewKind === 'pdf')) ? (
            <div className="empty-panel">
              <h3>当前不支持内嵌预览</h3>
              <p>这个文件类型会保存在项目目录里，你可以直接用系统默认程序打开。</p>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <div className="asset-meta">
            <p>{block.description}</p>
            <p>{formatFileSize(block.fileSize)}</p>
            <p>{block.resolvedPath || '文件不存在'}</p>
          </div>
          <button className="primary-button" onClick={onOpenAsset} type="button">
            用系统程序打开
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function SectionEditor({
  article,
  section,
  onAddText,
  onUpdateBlock,
  onDeleteBlock,
  onAddImage,
  onAddFile,
  onOpenAsset,
}: SectionEditorProps) {
  const [newText, setNewText] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [expandedTextBlock, setExpandedTextBlock] = useState<ContentBlock | null>(null)
  const [previewBlock, setPreviewBlock] = useState<ContentBlock | null>(null)
  const [previewPayload, setPreviewPayload] = useState<BlockPreview | null>(null)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    setNewText('')
    setNewDescription('')
    setExpandedTextBlock(null)
    setPreviewBlock(null)
    setPreviewPayload(null)
    setPreviewError('')
  }, [section.id])

  async function handleAddText() {
    if (!newText.trim()) {
      return
    }

    await onAddText(newText, newDescription)
    setNewText('')
    setNewDescription('')
  }

  async function handlePreview(block: ContentBlock) {
    setPreviewBlock(block)
    setPreviewPayload(null)
    setPreviewError('')

    try {
      const payload = await window.scipaper.getBlockPreview(article.id, block.id)
      setPreviewPayload(payload)
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : '附件预览失败')
    }
  }

  return (
    <div className="panel-stack">
      {expandedTextBlock ? (
        <TextBlockModal
          block={expandedTextBlock}
          onClose={() => setExpandedTextBlock(null)}
          onDelete={async () => {
            await onDeleteBlock(expandedTextBlock.id)
            setExpandedTextBlock(null)
          }}
          onSave={async (content, description) => {
            await onUpdateBlock(expandedTextBlock.id, content, description)
            setExpandedTextBlock(null)
          }}
        />
      ) : null}

      {previewBlock ? (
        <AssetPreviewModal
          block={previewBlock}
          preview={previewPayload}
          error={previewError}
          onClose={() => {
            setPreviewBlock(null)
            setPreviewPayload(null)
            setPreviewError('')
          }}
          onOpenAsset={async () => {
            await onOpenAsset(previewBlock.id)
          }}
        />
      ) : null}

      <section className="composer-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Section</p>
            <h3>{section.type}</h3>
            <p>这里展示当前章节的文本、图片、PDF 和备份文件。</p>
          </div>
          <div className="inline-actions">
            <button className="ghost-button" onClick={onAddImage} type="button">
              导入图片
            </button>
            <button className="ghost-button" onClick={onAddFile} type="button">
              导入文件
            </button>
          </div>
        </div>

        <label className="field">
          <span>内容备注</span>
          <input value={newDescription} onChange={(event) => setNewDescription(event.target.value)} placeholder="例如：这一段主要解释 Figure 2 的核心结果" />
        </label>
        <label className="field">
          <span>新增文本</span>
          <textarea rows={6} value={newText} onChange={(event) => setNewText(event.target.value)} placeholder="在这里补充本章节内容..." />
        </label>
        <button className="primary-button" onClick={handleAddText} type="button">
          保存文本块
        </button>
      </section>

      {section.contentBlocks.length === 0 ? (
        <section className="empty-panel">
          <h3>这个章节还没有内容</h3>
          <p>先加一段文本，或者导入图片、SVG、TIFF、PDF 等附件。</p>
        </section>
      ) : (
        section.contentBlocks.map((block) => {
          if (block.type === 'Text') {
            return (
              <article key={block.id} className="content-card text-summary-card">
                <div className="content-card-header">
                  <div>
                    <p className="eyebrow">文本块</p>
                    <strong>{block.description || '未命名文本块'}</strong>
                    <p className="muted-text">
                      来源 {block.updatedBy || block.createdBy || '未知'} · {formatDate(block.updatedAt)}
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button className="ghost-button" onClick={() => onDeleteBlock(block.id)} type="button">
                      删除
                    </button>
                    <button className="primary-button" onClick={() => setExpandedTextBlock(block)} type="button">
                      展开编辑
                    </button>
                  </div>
                </div>

                <p className="text-block-preview">{getPreviewSummary(block)}</p>

                {block.type === 'Text' && block.versions.length > 0 && (
                  <DiffViewer 
                    versions={block.versions}
                    currentContent={block.content}
                  />
                )}
              </article>
            )
          }

          return (
            <article key={block.id} className="content-card asset-card">
              <div className="content-card-header">
                <div>
                  <p className="eyebrow">{block.type === 'Image' ? '图片附件' : '文件备份'}</p>
                  <strong>{block.fileName || block.description}</strong>
                  <p className="muted-text">
                    来源 {block.updatedBy || block.createdBy || '未知'} · {formatDate(block.updatedAt)}
                  </p>
                </div>
                <div className="inline-actions">
                  <button className="ghost-button" onClick={() => onDeleteBlock(block.id)} type="button">
                    删除
                  </button>
                  <button className="ghost-button" onClick={() => handlePreview(block)} type="button">
                    预览
                  </button>
                  <button className="primary-button" onClick={() => onOpenAsset(block.id)} type="button">
                    打开
                  </button>
                </div>
              </div>

              {block.type === 'Image' && block.previewUrl ? (
                <img className="asset-preview" src={block.previewUrl} alt={block.description || block.fileName || '附件图片'} />
              ) : null}

              <div className="asset-meta">
                <p>{block.description}</p>
                <p>{formatFileSize(block.fileSize)}</p>
                <p>{block.resolvedPath || '文件不存在'}</p>
              </div>
            </article>
          )
        })
      )}
    </div>
  )
}
