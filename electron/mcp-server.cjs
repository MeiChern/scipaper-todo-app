const z = require('zod/v4');
const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  addAssetBlock,
  addCitation,
  addReviewComment,
  addReviewRound,
  addRevision,
  addTextBlock,
  createArticle,
  getArticleById,
  getMcpResourceOverview,
  getSectionByArticle,
  getWritingGuidance,
  updateSectionContent,
} = require('./storage.cjs');

const SECTION_ALIASES = {
  title: 'Title',
  abstract: 'Abstract',
  introduction: 'Introduction',
  methods: 'MaterialsAndMethods',
  results: 'Results',
  discussion: 'Discussion',
  references: 'References',
};

function normalizeSection(section) {
  return SECTION_ALIASES[section] || section;
}

function getClientLabel() {
  return process.env.SCIPAPER_MCP_CLIENT || process.env.MCP_CLIENT_NAME || 'MCP Client';
}

function asJsonContent(uri, payload) {
  return {
    contents: [
      {
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function asTextResult(payload) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function startMcpServer() {
  const server = new McpServer({
    name: 'scipaper-todo',
    version: '1.0.0',
  });

  server.registerResource(
    'article-overview',
    new ResourceTemplate('scipaper://article/{articleId}/overview', { list: undefined }),
    {
      title: 'Article Overview',
      description: '获取文章全景信息',
      mimeType: 'application/json',
    },
    async (uri, { articleId }) => asJsonContent(uri, getMcpResourceOverview(getArticleById(articleId))),
  );

  server.registerResource(
    'article-research-context',
    new ResourceTemplate('scipaper://article/{articleId}/research-context', { list: undefined }),
    {
      title: 'Research Context',
      description: '获取研究上下文',
      mimeType: 'application/json',
    },
    async (uri, { articleId }) => asJsonContent(uri, getArticleById(articleId).researchContext),
  );

  server.registerResource(
    'article-pending-reviews',
    new ResourceTemplate('scipaper://article/{articleId}/pending-reviews', { list: undefined }),
    {
      title: 'Pending Reviews',
      description: '获取待处理审稿意见',
      mimeType: 'application/json',
    },
    async (uri, { articleId }) =>
      asJsonContent(
        uri,
        getArticleById(articleId).reviewRounds.flatMap((round) =>
          round.comments
            .filter((comment) => comment.status !== 'Completed')
            .map((comment) => ({
              round: round.roundNumber,
              ...comment,
            })),
        ),
      ),
  );

  server.registerResource(
    'article-citations',
    new ResourceTemplate('scipaper://article/{articleId}/citations', { list: undefined }),
    {
      title: 'Citations',
      description: '获取参考文献列表',
      mimeType: 'application/json',
    },
    async (uri, { articleId }) => asJsonContent(uri, getArticleById(articleId).citations),
  );

  server.registerResource(
    'article-section',
    new ResourceTemplate('scipaper://article/{articleId}/section/{section}', { list: undefined }),
    {
      title: 'Section Content',
      description: '获取特定章节内容',
      mimeType: 'application/json',
    },
    async (uri, { articleId, section }) => asJsonContent(uri, getSectionByArticle(articleId, normalizeSection(section))),
  );

  server.registerTool(
    'create_article',
    {
      description: '创建新论文项目',
      inputSchema: {
        title: z.string().optional(),
        targetJournal: z.string().optional(),
        scientificQuestion: z.string(),
        observedPhenomenon: z.string(),
        hypothesis: z.string(),
        approach: z.string(),
      },
    },
    async ({ title, targetJournal, scientificQuestion, observedPhenomenon, hypothesis, approach }) => {
      const article = createArticle({
        title,
        targetJournal,
        researchContext: {
          scientificQuestion,
          observedPhenomenon,
          hypothesis,
          approach,
        },
      });

      return asTextResult({ success: true, article_id: article.id });
    },
  );

  server.registerTool(
    'add_finding',
    {
      description: '向 Results 章节添加研究发现',
      inputSchema: {
        article_id: z.string(),
        content: z.string(),
        image_paths: z.array(z.string()).optional(),
        file_links: z.array(z.string()).optional(),
      },
    },
    async ({ article_id, content, image_paths, file_links }) => {
      addTextBlock(article_id, 'Results', content, 'MCP 添加研究发现', getClientLabel());

      for (const imagePath of image_paths ?? []) {
        addAssetBlock(article_id, 'Results', 'image', imagePath, getClientLabel());
      }

      for (const filePath of file_links ?? []) {
        addAssetBlock(article_id, 'Results', 'file', filePath, getClientLabel());
      }

      return asTextResult({ success: true });
    },
  );

  server.registerTool(
    'update_section',
    {
      description: '更新章节文本内容',
      inputSchema: {
        article_id: z.string(),
        section: z.enum(['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'references']),
        content: z.string(),
        mode: z.enum(['append', 'replace']).default('append'),
        description: z.string().optional(),
      },
    },
    async ({ article_id, section, content, mode, description }) => {
      updateSectionContent(article_id, normalizeSection(section), content, mode, description || 'MCP 更新章节', getClientLabel());
      return asTextResult({ success: true });
    },
  );

  server.registerTool(
    'add_citation',
    {
      description: '添加参考文献记录',
      inputSchema: {
        article_id: z.string(),
        bibtex: z.string(),
        title: z.string(),
        authors: z.string(),
        year: z.string(),
        local_pdf: z.string().optional(),
        relevant_sections: z.array(z.string()).optional(),
      },
    },
    async ({ article_id, bibtex, title, authors, year, local_pdf, relevant_sections }) => {
      addCitation(article_id, {
        bibtex,
        title,
        authors,
        year,
        localPdfPath: local_pdf,
        relevantSections: (relevant_sections ?? []).map(normalizeSection),
      });

      return asTextResult({ success: true });
    },
  );

  server.registerTool(
    'record_review_comment',
    {
      description: '记录新的审稿意见',
      inputSchema: {
        article_id: z.string(),
        round: z.number(),
        reviewer_id: z.string().optional(),
        comment_text: z.string(),
        comment_type: z.enum(['Major', 'Minor']).default('Major'),
        suggested_section: z.string().optional(),
      },
    },
    async ({ article_id, round, reviewer_id, comment_text, comment_type, suggested_section }) => {
      const article = getArticleById(article_id);
      let roundRecord = article.reviewRounds.find((item) => item.roundNumber === round);

      if (!roundRecord) {
        addReviewRound(article_id, {
          roundNumber: round,
          submittedAt: new Date().toISOString().slice(0, 10),
          journalName: article.targetJournal || '未填写',
          manuscriptNumber: '',
        });
        roundRecord = getArticleById(article_id).reviewRounds.find((item) => item.roundNumber === round);
      }

      addReviewComment(article_id, roundRecord.id, {
        reviewerId: reviewer_id,
        originalText: comment_text,
        type: comment_type,
        suggestedSection: normalizeSection(suggested_section || ''),
      });

      return asTextResult({ success: true, round_id: roundRecord.id });
    },
  );

  server.registerTool(
    'mark_revision_completed',
    {
      description: '标记审稿意见修改完成',
      inputSchema: {
        article_id: z.string(),
        comment_id: z.string(),
        response_text: z.string().optional(),
        modified_block_ids: z.array(z.string()).optional(),
        description: z.string(),
      },
    },
    async ({ article_id, comment_id, response_text, modified_block_ids, description }) => {
      const article = getArticleById(article_id);
      const round = article.reviewRounds.find((item) => item.comments.some((comment) => comment.id === comment_id));

      if (!round) {
        throw new Error('Review comment not found');
      }

      addRevision(article_id, round.id, comment_id, {
        description,
        responseText: response_text,
        modifiedBlockIds: modified_block_ids,
        markCompleted: true,
      });

      return asTextResult({ success: true, round_id: round.id });
    },
  );

  server.registerTool(
    'get_writing_guidance',
    {
      description: '基于 ResearchContext 获取写作建议',
      inputSchema: {
        article_id: z.string(),
        target_section: z.string(),
      },
    },
    async ({ article_id, target_section }) =>
      asTextResult({
        guidance: getWritingGuidance(article_id, normalizeSection(target_section)),
      }),
  );

  server.registerPrompt(
    'generate-outline',
    {
      description: '基于 ResearchContext 生成论文大纲建议',
      argsSchema: {
        article_id: z.string(),
      },
    },
    async ({ article_id }) => {
      const article = getArticleById(article_id);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请基于以下信息输出这篇生命科学论文的 IMRaD 大纲建议：\n标题：${article.title}\n科学问题：${article.researchContext.scientificQuestion}\n观察现象：${article.researchContext.observedPhenomenon}\n假设：${article.researchContext.hypothesis}\n方案：${article.researchContext.approach}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'analyze-results',
    {
      description: '分析 Results 内容并建议 Discussion 写作方向',
      argsSchema: {
        article_id: z.string(),
      },
    },
    async ({ article_id }) => {
      const results = getSectionByArticle(article_id, 'Results');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请根据下面的 Results 内容，给出 Discussion 的写作方向与结构建议：\n${JSON.stringify(results, null, 2)}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'draft-response-letter',
    {
      description: '根据修改记录生成回复信草稿',
      argsSchema: {
        article_id: z.string(),
        round: z.number(),
      },
    },
    async ({ article_id, round }) => {
      const article = getArticleById(article_id);
      const roundRecord = article.reviewRounds.find((item) => item.roundNumber === round);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请根据以下第 ${round} 轮审稿记录，生成礼貌、逐条对应的回复信草稿：\n${JSON.stringify(roundRecord, null, 2)}`,
            },
          },
        ],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

module.exports = {
  startMcpServer,
};
