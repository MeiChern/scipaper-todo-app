const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const SECTION_TYPES = [
  'Title',
  'Abstract',
  'Introduction',
  'MaterialsAndMethods',
  'Results',
  'Discussion',
  'References',
];

const ARTICLE_STATUSES = [
  'Drafting',
  'Submitted',
  'UnderReview',
  'Revision',
  'Resubmitted',
  'Accepted',
  'Rejected',
  'Published',
];

const THESIS_STATUSES = [
  'Proposal',
  'InProgress',
  'DefenseReady',
  'Defended',
  'Revised',
  'Final',
];

const THESIS_SECTION_TYPES = [
  'Cover',
  'Declaration',
  'Abstract',
  'Acknowledgements',
  'TableOfContents',
  'ListOfFigures',
  'ListOfTables',
  'Chapter',
  'Conclusion',
  'References',
  'Appendix',
];

const DEGREE_TYPES = ['Master', 'PhD'];

const BASE_DIRECTORY = path.join(os.homedir(), 'Documents', 'SciPaperTodo');
const ARTICLES_DIRECTORY = path.join(BASE_DIRECTORY, 'Articles');
const DATABASE_PATH = path.join(BASE_DIRECTORY, 'database.json');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.tif', '.tiff']);
const PDF_EXTENSIONS = new Set(['.pdf']);
const THESES_DIRECTORY = path.join(BASE_DIRECTORY, 'Theses');

function now() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function ensureStore() {
  fs.mkdirSync(ARTICLES_DIRECTORY, { recursive: true });
  fs.mkdirSync(THESES_DIRECTORY, { recursive: true });

  if (!fs.existsSync(DATABASE_PATH)) {
    fs.writeFileSync(
      DATABASE_PATH,
      JSON.stringify({
        version: 1,
        articles: [],
        theses: [],
        writingStreak: {
          currentStreak: 0,
          longestStreak: 0,
          lastWriteDate: null,
          todayWordCount: 0,
          totalWordCount: 0,
          dailyGoal: 500,
        },
      }, null, 2),
      'utf-8',
    );
  }
}

function readDatabase() {
  ensureStore();
  const raw = fs.readFileSync(DATABASE_PATH, 'utf-8');
  return normalizeStoredDatabase(JSON.parse(raw));
}

function writeDatabase(data) {
  ensureStore();
  fs.writeFileSync(DATABASE_PATH, JSON.stringify(normalizeStoredDatabase(data), null, 2), 'utf-8');
}

function createArticleFolder(articleId) {
  const articleRoot = path.join(ARTICLES_DIRECTORY, articleId);
  fs.mkdirSync(path.join(articleRoot, 'Attachments'), { recursive: true });
  fs.mkdirSync(path.join(articleRoot, 'Exports'), { recursive: true });
  return articleRoot;
}

function createThesisFolder(thesisId) {
  const thesisRoot = path.join(THESES_DIRECTORY, thesisId);
  fs.mkdirSync(path.join(thesisRoot, 'Attachments'), { recursive: true });
  fs.mkdirSync(path.join(thesisRoot, 'Exports'), { recursive: true });
  return thesisRoot;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBlockType(type) {
  const normalized = String(type || '').toLowerCase();

  if (normalized === 'text') {
    return 'Text';
  }

  if (normalized === 'image') {
    return 'Image';
  }

  if (normalized === 'filelink' || normalized === 'file') {
    return 'FileLink';
  }

  return type;
}

function normalizeStoredBlock(block) {
  return {
    ...block,
    type: normalizeBlockType(block.type),
    versions: Array.isArray(block.versions) ? block.versions : [],
  };
}

function normalizeStoredDatabase(data) {
  return {
    version: data.version ?? 1,
    articles: (data.articles ?? []).map((article) => ({
      ...article,
      sections: (article.sections ?? []).map((section) => ({
        ...section,
        contentBlocks: (section.contentBlocks ?? []).map(normalizeStoredBlock),
      })),
      reviewRounds: article.reviewRounds ?? [],
      citations: article.citations ?? [],
    })),
    theses: (data.theses ?? []).map((thesis) => ({
      ...thesis,
      sections: (thesis.sections ?? []).map((section) => ({
        ...section,
        contentBlocks: (section.contentBlocks ?? []).map(normalizeStoredBlock),
      })),
    })),
    writingStreak: data.writingStreak ?? {
      currentStreak: 0,
      longestStreak: 0,
      lastWriteDate: null,
      todayWordCount: 0,
      totalWordCount: 0,
      dailyGoal: 500,
    },
  };
}

function isWindowsAbsolutePath(value) {
  return /^[a-zA-Z]:[\\/]/.test(value);
}

function normalizeRelativeAssetPath(value) {
  return value.split(/[\\/]+/).filter(Boolean).join(path.sep);
}

function windowsPathToCurrentPlatform(value) {
  if (process.platform === 'win32') {
    return value;
  }

  const drive = value[0].toLowerCase();
  const rest = value.slice(2).split(/[\\/]+/).filter(Boolean);
  return path.join('/mnt', drive, ...rest);
}

function createSection(type, orderIndex) {
  return {
    id: createId(),
    type,
    orderIndex,
    contentBlocks: [],
  };
}

function createTextVersion(content, modifiedBy, changeDescription) {
  return {
    id: createId(),
    content,
    modifiedAt: now(),
    modifiedBy,
    changeDescription,
  };
}

function createArticle(input) {
  const database = readDatabase();
  const timestamp = now();
  const articleId = createId();

  const article = {
    id: articleId,
    title: normalizeText(input.title) || '未命名研究',
    targetJournal: normalizeText(input.targetJournal),
    status: ARTICLE_STATUSES.includes(input.status) ? input.status : 'Drafting',
    createdAt: timestamp,
    updatedAt: timestamp,
    researchContext: {
      id: createId(),
      articleId,
      scientificQuestion: normalizeText(input.researchContext?.scientificQuestion),
      observedPhenomenon: normalizeText(input.researchContext?.observedPhenomenon),
      hypothesis: normalizeText(input.researchContext?.hypothesis),
      approach: normalizeText(input.researchContext?.approach),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    sections: SECTION_TYPES.map((type, index) => createSection(type, index)),
    reviewRounds: [],
    citations: [],
  };

  database.articles.unshift(article);
  createArticleFolder(articleId);
  writeDatabase(database);

  return article;
}

function createThesis(input) {
  const database = readDatabase();
  const timestamp = now();
  const thesisId = createId();

  const thesis = {
    id: thesisId,
    title: normalizeText(input.title) || '未命名论文',
    degree: DEGREE_TYPES.includes(input.degree) ? input.degree : 'Master',
    university: normalizeText(input.university),
    department: normalizeText(input.department),
    studentName: normalizeText(input.studentName),
    supervisorName: normalizeText(input.supervisorName),
    status: THESIS_STATUSES.includes(input.status) ? input.status : 'Proposal',
    createdAt: timestamp,
    updatedAt: timestamp,
    sections: THESIS_SECTION_TYPES.map((type, index) => createSection(type, index)),
  };

  database.theses.unshift(thesis);
  createThesisFolder(thesisId);
  writeDatabase(database);

  return thesis;
}

function findThesis(database, thesisId) {
  const thesis = database.theses.find((item) => item.id === thesisId);

  if (!thesis) {
    throw new Error('Thesis not found');
  }

  return thesis;
}

function touchThesis(thesis) {
  thesis.updatedAt = now();
}

function updateThesisMeta(thesisId, patch) {
  const database = readDatabase();
  const thesis = findThesis(database, thesisId);

  thesis.title = normalizeText(patch.title) || thesis.title;
  thesis.degree = DEGREE_TYPES.includes(patch.degree) ? patch.degree : thesis.degree;
  thesis.university = normalizeText(patch.university) || thesis.university;
  thesis.department = normalizeText(patch.department) || thesis.department;
  thesis.studentName = normalizeText(patch.studentName) || thesis.studentName;
  thesis.supervisorName = normalizeText(patch.supervisorName) || thesis.supervisorName;
  thesis.status = THESIS_STATUSES.includes(patch.status) ? patch.status : thesis.status;
  touchThesis(thesis);

  writeDatabase(database);
}

function addThesisSection(thesisId, sectionType, title) {
  const database = readDatabase();
  const thesis = findThesis(database, thesisId);

  if (!THESIS_SECTION_TYPES.includes(sectionType)) {
    throw new Error(`Invalid thesis section type: ${sectionType}`);
  }

  const section = createSection(sectionType, thesis.sections.length);
  section.title = normalizeText(title) || sectionType;
  thesis.sections.push(section);
  touchThesis(thesis);

  writeDatabase(database);
}

function linkArticleToThesis(thesisId, articleId) {
  const database = readDatabase();
  const thesis = findThesis(database, thesisId);
  const article = findArticle(database, articleId);

  if (!thesis.linkedArticles) {
    thesis.linkedArticles = [];
  }

  if (thesis.linkedArticles.includes(articleId)) {
    return;
  }

  thesis.linkedArticles.push(articleId);
  touchThesis(thesis);

  writeDatabase(database);
}

function unlinkArticleFromThesis(thesisId, articleId) {
  const database = readDatabase();
  const thesis = findThesis(database, thesisId);

  if (!thesis.linkedArticles) {
    return;
  }

  thesis.linkedArticles = thesis.linkedArticles.filter((id) => id !== articleId);
  touchThesis(thesis);

  writeDatabase(database);
}

function updateDailyGoal(goal) {
  const database = readDatabase();

  if (typeof goal === 'number' && goal > 0) {
    database.writingStreak.dailyGoal = goal;
    writeDatabase(database);
  }
}

function updateWritingStreak(wordCount) {
  const database = readDatabase();
  const streak = database.writingStreak;
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastWriteDate === today) {
    streak.todayWordCount += wordCount;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (streak.lastWriteDate === yesterday) {
      streak.currentStreak += 1;
    } else if (streak.lastWriteDate !== today) {
      streak.currentStreak = 1;
    }

    streak.todayWordCount = wordCount;
    streak.lastWriteDate = today;
  }

  streak.totalWordCount += wordCount;

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  database.writingStreak = streak;
  writeDatabase(database);

  return streak;
}

function touchArticle(article) {
  article.updatedAt = now();
}

function findArticle(database, articleId) {
  const article = database.articles.find((item) => item.id === articleId);

  if (!article) {
    throw new Error('Article not found');
  }

  return article;
}

function findSection(article, sectionType) {
  const section = article.sections.find((item) => item.type === sectionType);

  if (!section) {
    throw new Error(`Section ${sectionType} not found`);
  }

  return section;
}

function findBlock(article, blockId) {
  for (const section of article.sections) {
    const block = section.contentBlocks.find((item) => item.id === blockId);

    if (block) {
      return { section, block };
    }
  }

  throw new Error('Content block not found');
}

function getArticleDirectory(articleId) {
  return path.join(ARTICLES_DIRECTORY, articleId);
}

function resolveBlockPath(articleId, block) {
  const blockType = normalizeBlockType(block.type);

  if (blockType === 'Text') {
    return null;
  }

  if (path.isAbsolute(block.content)) {
    return block.content;
  }

  if (isWindowsAbsolutePath(block.content)) {
    return windowsPathToCurrentPlatform(block.content);
  }

  return path.join(getArticleDirectory(articleId), normalizeRelativeAssetPath(block.content));
}

function enrichBlock(articleId, block) {
  const normalizedBlock = normalizeStoredBlock(block);
  const resolvedPath = resolveBlockPath(articleId, normalizedBlock);
  const stats = resolvedPath && fs.existsSync(resolvedPath) ? fs.statSync(resolvedPath) : null;

  return {
    ...normalizedBlock,
    resolvedPath,
    previewUrl: resolvedPath ? pathToFileURL(resolvedPath).toString() : null,
    fileName: resolvedPath ? path.basename(resolvedPath) : null,
    fileSize: stats?.isFile() ? stats.size : null,
  };
}

function enrichArticle(article) {
  return {
    ...article,
    sections: [...article.sections]
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((section) => ({
        ...section,
        contentBlocks: [...section.contentBlocks]
          .sort((left, right) => left.orderIndex - right.orderIndex)
          .map((block) => enrichBlock(article.id, block)),
      })),
    reviewRounds: [...article.reviewRounds].sort((left, right) => right.roundNumber - left.roundNumber),
  };
}

function loadState() {
  const database = readDatabase();

  return {
    baseDirectory: BASE_DIRECTORY,
    articles: [...database.articles]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(enrichArticle),
    theses: [...database.theses]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    writingStreak: database.writingStreak,
  };
}

function updateArticleMeta(articleId, patch) {
  const database = readDatabase();
  const article = findArticle(database, articleId);

  article.title = normalizeText(patch.title) || article.title;
  article.targetJournal = normalizeText(patch.targetJournal);
  article.status = ARTICLE_STATUSES.includes(patch.status) ? patch.status : article.status;
  touchArticle(article);

  writeDatabase(database);
}

function updateResearchContext(articleId, researchContext) {
  const database = readDatabase();
  const article = findArticle(database, articleId);

  article.researchContext = {
    ...article.researchContext,
    scientificQuestion: normalizeText(researchContext.scientificQuestion),
    observedPhenomenon: normalizeText(researchContext.observedPhenomenon),
    hypothesis: normalizeText(researchContext.hypothesis),
    approach: normalizeText(researchContext.approach),
    updatedAt: now(),
  };
  touchArticle(article);

  writeDatabase(database);
}

function addTextBlock(articleId, sectionType, content, description = '', modifiedBy = 'SciPaper Todo') {
  const cleanContent = normalizeText(content);

  if (!cleanContent) {
    throw new Error('Text content cannot be empty');
  }

  const database = readDatabase();
  const article = findArticle(database, articleId);
  const section = findSection(article, sectionType);
  const timestamp = now();

  section.contentBlocks.push({
    id: createId(),
    sectionId: section.id,
    type: 'Text',
    content: cleanContent,
    description: normalizeText(description),
    orderIndex: section.contentBlocks.length,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: modifiedBy,
    updatedBy: modifiedBy,
    versions: [createTextVersion(cleanContent, modifiedBy, '创建文本块')],
  });

  touchArticle(article);
  writeDatabase(database);
}

function updateSectionContent(articleId, sectionType, content, mode = 'append', description = '', modifiedBy = 'SciPaper Todo') {
  const cleanContent = normalizeText(content);

  if (!cleanContent) {
    throw new Error('Section content cannot be empty');
  }

  const database = readDatabase();
  const article = findArticle(database, articleId);
  const section = findSection(article, sectionType);
  const timestamp = now();

  if (mode === 'replace') {
    const nonTextBlocks = section.contentBlocks.filter((block) => normalizeBlockType(block.type) !== 'Text');

    section.contentBlocks = [
      {
        id: createId(),
        sectionId: section.id,
        type: 'Text',
        content: cleanContent,
        description: normalizeText(description) || '整节替换',
        orderIndex: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: modifiedBy,
        updatedBy: modifiedBy,
        versions: [createTextVersion(cleanContent, modifiedBy, description || '替换章节内容')],
      },
      ...nonTextBlocks,
    ].map((block, orderIndex) => ({
      ...block,
      orderIndex,
    }));
  } else {
    section.contentBlocks.push({
      id: createId(),
      sectionId: section.id,
      type: 'Text',
      content: cleanContent,
      description: normalizeText(description),
      orderIndex: section.contentBlocks.length,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: modifiedBy,
      updatedBy: modifiedBy,
      versions: [createTextVersion(cleanContent, modifiedBy, description || '追加章节内容')],
    });
  }

  touchArticle(article);
  writeDatabase(database);
}

function updateTextBlock(articleId, blockId, content, description = '', modifiedBy = 'SciPaper Todo') {
  const cleanContent = normalizeText(content);

  if (!cleanContent) {
    throw new Error('Text content cannot be empty');
  }

  const database = readDatabase();
  const article = findArticle(database, articleId);
  const { block } = findBlock(article, blockId);
  const previous = block.content;

  block.content = cleanContent;
  block.description = normalizeText(description);
  block.updatedAt = now();
  block.updatedBy = modifiedBy;

  if (previous !== cleanContent) {
    block.versions = block.versions ?? [];
    block.versions.unshift(createTextVersion(cleanContent, modifiedBy, '更新文本块'));
  }

  touchArticle(article);
  writeDatabase(database);
}

function countWords(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const cleaned = text.trim();
  if (!cleaned) {
    return 0;
  }

  const chineseChars = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = cleaned
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return chineseChars + englishWords;
}

function updateTextBlockWithStreak(articleId, blockId, content, description = '', modifiedBy = 'SciPaper Todo') {
  const cleanContent = normalizeText(content);

  if (!cleanContent) {
    throw new Error('Text content cannot be empty');
  }

  const database = readDatabase();
  const article = findArticle(database, articleId);
  const { block } = findBlock(article, blockId);
  const previous = block.content;

  block.content = cleanContent;
  block.description = normalizeText(description);
  block.updatedAt = now();
  block.updatedBy = modifiedBy;

  if (previous !== cleanContent) {
    block.versions = block.versions ?? [];
    block.versions.unshift(createTextVersion(cleanContent, modifiedBy, '更新文本块'));

    const previousWordCount = countWords(previous);
    const newWordCount = countWords(cleanContent);
    const addedWords = Math.max(0, newWordCount - previousWordCount);

    if (addedWords > 0) {
      updateWritingStreak(addedWords);
    }
  }

  touchArticle(article);
  writeDatabase(database);
}

function addCitation(articleId, payload) {
  const database = readDatabase();
  const article = findArticle(database, articleId);

  article.citations.unshift({
    id: createId(),
    articleId,
    bibtex: normalizeText(payload.bibtex),
    title: normalizeText(payload.title),
    authors: normalizeText(payload.authors),
    year: normalizeText(payload.year),
    localPdfPath: normalizeText(payload.localPdfPath),
    sectionLinks: (payload.relevantSections ?? []).map((sectionType) => {
      const section = article.sections.find((item) => item.type === sectionType);

      return {
        citationId: createId(),
        sectionId: section?.id || '',
        context: '',
      };
    }),
  });

  touchArticle(article);
  writeDatabase(database);
}

function deleteBlock(articleId, blockId) {
  const database = readDatabase();
  const article = findArticle(database, articleId);

  for (const section of article.sections) {
    const index = section.contentBlocks.findIndex((item) => item.id === blockId);

    if (index >= 0) {
      section.contentBlocks.splice(index, 1);
      section.contentBlocks = section.contentBlocks.map((block, orderIndex) => ({
        ...block,
        orderIndex,
      }));
      touchArticle(article);
      writeDatabase(database);
      return;
    }
  }

  throw new Error('Content block not found');
}

function inferPreviewKind(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (IMAGE_EXTENSIONS.has(extension)) {
    return extension === '.tif' || extension === '.tiff' ? 'tiff' : 'image';
  }

  if (PDF_EXTENSIONS.has(extension)) {
    return 'pdf';
  }

  return 'none';
}

function addAssetBlock(articleId, sectionType, kind, sourcePath, modifiedBy = 'SciPaper Todo') {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const section = findSection(article, sectionType);
  const timestamp = now();
  const originalName = path.basename(sourcePath);
  const articleRoot = createArticleFolder(articleId);
  const attachmentsDir = path.join(articleRoot, 'Attachments');
  const safeName = `${Date.now()}-${originalName.replace(/\s+/g, '-')}`;
  const destination = path.join(attachmentsDir, safeName);

  fs.copyFileSync(sourcePath, destination);

  const storedValue = path.join('Attachments', safeName);
  const description = kind === 'image' ? `图像附件 · ${originalName}` : `备份文件 · ${originalName}`;
  const type = kind === 'image' ? 'Image' : 'FileLink';

  section.contentBlocks.push({
    id: createId(),
    sectionId: section.id,
    type,
    content: storedValue,
    description,
    orderIndex: section.contentBlocks.length,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: modifiedBy,
    updatedBy: modifiedBy,
    versions: [],
  });

  touchArticle(article);
  writeDatabase(database);
}

function addReviewRound(articleId, payload) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const nextRoundNumber =
    payload.roundNumber ||
    (article.reviewRounds.length > 0
      ? Math.max(...article.reviewRounds.map((round) => round.roundNumber)) + 1
      : 1);

  article.reviewRounds.unshift({
    id: createId(),
    articleId,
    roundNumber: nextRoundNumber,
    submittedAt: payload.submittedAt || now().slice(0, 10),
    journalName: normalizeText(payload.journalName) || article.targetJournal || '未填写',
    manuscriptNumber: normalizeText(payload.manuscriptNumber),
    reviewReceivedAt: payload.reviewReceivedAt || '',
    comments: [],
  });

  if (nextRoundNumber > 1) {
    article.status = 'Revision';
  }

  touchArticle(article);
  writeDatabase(database);
}

function addReviewComment(articleId, roundId, payload) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const round = article.reviewRounds.find((item) => item.id === roundId);

  if (!round) {
    throw new Error('Review round not found');
  }

  round.comments.unshift({
    id: createId(),
    reviewRoundId: roundId,
    reviewerId: normalizeText(payload.reviewerId) || `Reviewer ${round.comments.length + 1}`,
    originalText: normalizeText(payload.originalText),
    type: payload.type === 'Minor' ? 'Minor' : 'Major',
    suggestedSection: normalizeText(payload.suggestedSection),
    status: payload.status || 'Pending',
    revisions: [],
  });

  if (!round.reviewReceivedAt) {
    round.reviewReceivedAt = now().slice(0, 10);
  }

  article.status = 'UnderReview';
  touchArticle(article);
  writeDatabase(database);
}

function updateReviewCommentStatus(articleId, roundId, commentId, status) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const round = article.reviewRounds.find((item) => item.id === roundId);
  const comment = round?.comments.find((item) => item.id === commentId);

  if (!comment) {
    throw new Error('Review comment not found');
  }

  comment.status = status;
  touchArticle(article);
  writeDatabase(database);
}

function addRevision(articleId, roundId, commentId, payload) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const round = article.reviewRounds.find((item) => item.id === roundId);
  const comment = round?.comments.find((item) => item.id === commentId);

  if (!comment) {
    throw new Error('Review comment not found');
  }

  comment.revisions.unshift({
    id: createId(),
    reviewCommentId: commentId,
    description: normalizeText(payload.description),
    responseText: normalizeText(payload.responseText),
    modifiedBlockIds: payload.modifiedBlockIds ?? [],
    completedAt: now(),
    isVerified: Boolean(payload.isVerified),
  });
  comment.status = payload.markCompleted ? 'Completed' : comment.status;
  article.status = payload.markCompleted ? 'Revision' : article.status;
  touchArticle(article);

  writeDatabase(database);
}

function exportMarkdown(articleId) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const articleRoot = createArticleFolder(articleId);
  const exportDir = path.join(articleRoot, 'Exports');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  const sectionTitles = {
    Title: '# 标题',
    Abstract: '## 摘要',
    Introduction: '## 前言',
    MaterialsAndMethods: '## 材料与方法',
    Results: '## 结果',
    Discussion: '## 讨论',
    References: '## 参考文献',
  };

  const markdown = [
    `# ${article.title}`,
    '',
    `- 目标期刊: ${article.targetJournal || '未填写'}`,
    `- 状态: ${article.status}`,
    '',
    '## 研究上下文',
    '',
    `- 科学问题: ${article.researchContext.scientificQuestion || '未填写'}`,
    `- 观察现象: ${article.researchContext.observedPhenomenon || '未填写'}`,
    `- 假设: ${article.researchContext.hypothesis || '未填写'}`,
    `- 方案: ${article.researchContext.approach || '未填写'}`,
    '',
    ...article.sections.flatMap((section) => {
      const lines = [sectionTitles[section.type], ''];

      if (section.contentBlocks.length === 0) {
        lines.push('_暂无内容_', '');
        return lines;
      }

      for (const block of section.contentBlocks.sort((left, right) => left.orderIndex - right.orderIndex)) {
        const blockType = normalizeBlockType(block.type);

        if (blockType === 'Text') {
          lines.push(block.content, '');
        } else if (blockType === 'Image') {
          const assetPath = resolveBlockPath(article.id, block);
          lines.push(`![${block.description || '图片'}](${assetPath})`, '');
        } else {
          const assetPath = resolveBlockPath(article.id, block);
          lines.push(`[${block.description || '文件'}](${assetPath})`, '');
        }
      }

      return lines;
    }),
  ].join('\n');

  const exportPath = path.join(exportDir, `${article.title.replace(/[^\w\u4e00-\u9fa5-]+/g, '-') || 'manuscript'}-${stamp}.md`);
  fs.writeFileSync(exportPath, markdown, 'utf-8');
  return exportPath;
}

function openPathForBlock(articleId, blockId) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const { block } = findBlock(article, blockId);
  return resolveBlockPath(articleId, block);
}

function getPreviewPayload(articleId, blockId) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const { block } = findBlock(article, blockId);
  const resolvedPath = resolveBlockPath(articleId, block);

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    throw new Error('Preview file not found');
  }

  return {
    path: resolvedPath,
    previewKind: inferPreviewKind(resolvedPath),
    fileName: path.basename(resolvedPath),
    extension: path.extname(resolvedPath).toLowerCase(),
  };
}

function getPendingReviewsCount(article) {
  return article.reviewRounds.reduce(
    (count, round) => count + round.comments.filter((comment) => comment.status !== 'Completed').length,
    0,
  );
}

function getWritingGuidance(articleId, targetSection) {
  const database = readDatabase();
  const article = findArticle(database, articleId);
  const context = article.researchContext;
  const hints = {
    Title: [
      `把科学问题“${context.scientificQuestion || '研究问题'}”压缩成一句可投稿的标题。`,
      '优先体现变量关系、模型系统和主要发现，不要一开始就写结论式夸张表述。',
    ],
    Abstract: [
      '按背景、问题、方法、结果、结论五句结构起草。',
      `摘要里至少点到方法关键词：${context.approach || '核心实验方案'}`,
    ],
    Introduction: [
      `第一段先界定问题：${context.scientificQuestion || '当前研究问题'}`,
      `第二段承接现象：${context.observedPhenomenon || '关键观察现象'}`,
      `末段落到假设与研究目标：${context.hypothesis || '研究假设'}`,
    ],
    MaterialsAndMethods: [
      `把方案“${context.approach || '实验流程'}”拆成材料、处理、检测、统计四块。`,
      '先记录样本量、重复次数、统计方法，再补试剂和仪器型号。',
    ],
    Results: [
      '每个结果块只证明一个命题，先图后文。',
      `优先解释与假设“${context.hypothesis || '研究假设'}”直接相关的数据。`,
    ],
    Discussion: [
      '先回扣主要发现，再解释机制，再谈局限与下一步。',
      `把观察现象“${context.observedPhenomenon || '现象'}”与文献中的相近现象作对照。`,
    ],
    References: [
      '先补齐核心领域综述，再补最近三年最直接的机制研究。',
      '如果某个结论还没有文献支撑，先在这一节留空位，不要在正文里硬写。',
    ],
  };

  return hints[targetSection] || [];
}

function getMcpResourceOverview(article) {
  const sectionsCompletion = {};

  for (const section of article.sections) {
    const latestBlock = [...section.contentBlocks].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

    sectionsCompletion[section.type] = {
      blockCount: section.contentBlocks.length,
      lastModified: latestBlock?.updatedAt || article.updatedAt,
    };
  }

  return {
    id: article.id,
    title: article.title,
    target_journal: article.targetJournal,
    status: article.status,
    research_context: {
      question: article.researchContext.scientificQuestion,
      phenomenon: article.researchContext.observedPhenomenon,
      hypothesis: article.researchContext.hypothesis,
      approach: article.researchContext.approach,
    },
    sections_completion: sectionsCompletion,
    active_review_round: article.reviewRounds[0]?.roundNumber ?? null,
    pending_comments_count: getPendingReviewsCount(article),
  };
}

function getArticleById(articleId) {
  const database = readDatabase();
  return findArticle(database, articleId);
}

function getSectionByArticle(articleId, sectionType) {
  const article = getArticleById(articleId);
  return findSection(article, sectionType);
}

module.exports = {
  SECTION_TYPES,
  ARTICLE_STATUSES,
  THESIS_STATUSES,
  THESIS_SECTION_TYPES,
  DEGREE_TYPES,
  BASE_DIRECTORY,
  THESES_DIRECTORY,
  DATABASE_PATH,
  createArticle,
  createThesis,
  loadState,
  updateArticleMeta,
  updateResearchContext,
  addTextBlock,
  updateSectionContent,
  updateTextBlock,
  updateTextBlockWithStreak,
  updateWritingStreak,
  countWords,
  addCitation,
  deleteBlock,
  addAssetBlock,
  addReviewRound,
  addReviewComment,
  updateReviewCommentStatus,
  addRevision,
  exportMarkdown,
  openPathForBlock,
  getPreviewPayload,
  getArticleDirectory,
  getWritingGuidance,
  getArticleById,
  getSectionByArticle,
  getMcpResourceOverview,
  updateThesisMeta,
  addThesisSection,
  linkArticleToThesis,
  unlinkArticleFromThesis,
  updateDailyGoal,
};
