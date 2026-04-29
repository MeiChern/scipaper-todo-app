import type { McpInfo } from '../types'

interface McpPanelProps {
  info: McpInfo | null
}

export function McpPanel({ info }: McpPanelProps) {
  if (!info) {
    return (
      <section className="empty-panel">
        <h3>MCP 信息加载失败</h3>
        <p>请重新启动应用后再试。</p>
      </section>
    )
  }

  return (
    <div className="panel-stack">
      <section className="panel-card">
        <p className="eyebrow">MCP Bridge</p>
        <h3>连接 Cursor / Claude Code</h3>
        <div className="plain-list">
          <p>命令路径: {info.command}</p>
          <p>启动参数: {info.args.join(' ')}</p>
          <p>本地数据目录: {info.baseDirectory}</p>
          <p>实时同步: MCP 写入后，应用会自动刷新，不需要重启。</p>
          <p>附件备份: 通过 MCP 写入的图片和文件会自动复制到文章目录下的 Attachments。</p>
        </div>
      </section>

      <section className="panel-card">
        <p className="eyebrow">使用步骤</p>
        <h3>推荐接入方式</h3>
        <div className="revision-list">
          <div className="revision-item">
            <strong>1. 安装桌面版</strong>
            <p>先启动 SciPaper Todo，创建文章后再配置 MCP。这样本地目录和数据库会先初始化。</p>
          </div>
          <div className="revision-item">
            <strong>2. 复制配置</strong>
            <p>把下面的 JSON 复制到 Cursor 或 Claude Code 的 MCP 配置里。</p>
          </div>
          <div className="revision-item">
            <strong>3. 设置来源名</strong>
            <p>将 `SCIPAPER_MCP_CLIENT` 改成 `Cursor`、`Claude Code` 或你自己的名字，软件会在内容块里显示写入来源。</p>
          </div>
          <div className="revision-item">
            <strong>4. 开始写入</strong>
            <p>MCP 可读取研究上下文、章节内容、待处理审稿意见，也可追加文本、导入图片/PDF、记录审稿修改。</p>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">mcp.json</p>
            <h3>可直接复制的配置</h3>
          </div>
          <button className="primary-button" onClick={() => window.scipaper.copyText(info.configJson)} type="button">
            复制配置
          </button>
        </div>
        <pre className="code-block">{info.configJson}</pre>
      </section>

      {info.examples ? (
        <>
          <section className="panel-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Cursor 示例</p>
                <h3>为 Cursor 标记来源</h3>
              </div>
              <button className="ghost-button" onClick={() => window.scipaper.copyText(info.examples!.cursor)} type="button">
                复制 Cursor 示例
              </button>
            </div>
            <pre className="code-block">{info.examples.cursor}</pre>
          </section>

          <section className="panel-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Claude Code 示例</p>
                <h3>为 Claude Code 标记来源</h3>
              </div>
              <button className="ghost-button" onClick={() => window.scipaper.copyText(info.examples!.claudeCode)} type="button">
                复制 Claude Code 示例
              </button>
            </div>
            <pre className="code-block">{info.examples.claudeCode}</pre>
          </section>
        </>
      ) : null}
    </div>
  )
}
