const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const {
  addAssetBlock,
  addReviewComment,
  DATABASE_PATH,
  addReviewRound,
  addRevision,
  addTextBlock,
  deleteBlock,
  exportMarkdown,
  getArticleDirectory,
  getPreviewPayload,
  getWritingGuidance,
  loadState,
  openPathForBlock,
  updateArticleMeta,
  updateResearchContext,
  updateReviewCommentStatus,
  updateTextBlockWithStreak,
  createArticle,
  createThesis,
  updateThesisMeta,
  addThesisSection,
  linkArticleToThesis,
  unlinkArticleFromThesis,
  updateDailyGoal,
  addMoodEntry,
  getMoodHistory,
  addPomodoroSession,
  getPomodoroStats,
  BASE_DIRECTORY,
  getTheme,
  setTheme,
  getWritingStats,
  addTag,
  removeTag,
} = require('./storage.cjs');
const { startMcpServer } = require('./mcp-server.cjs');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isMcpMode = process.argv.includes('--mcp-server');

function buildMcpInfo() {
  const genericConfig = {
    mcpServers: {
      'scipaper-todo': {
        command: process.execPath,
        args: ['--mcp-server'],
        env: {
          SCIPAPER_MCP_CLIENT: 'Cursor',
        },
      },
    },
  };

  const config = {
    mcpServers: {
      'scipaper-todo': {
        command: process.execPath,
        args: ['--mcp-server'],
        env: {
          SCIPAPER_MCP_CLIENT: 'Cursor',
        },
      },
    },
  };

  return {
    command: process.execPath,
    args: ['--mcp-server'],
    baseDirectory: BASE_DIRECTORY,
    configJson: JSON.stringify(config, null, 2),
    examples: {
      generic: JSON.stringify(genericConfig, null, 2),
      cursor: JSON.stringify(genericConfig, null, 2),
      claudeCode: JSON.stringify(
        {
          mcpServers: {
            'scipaper-todo': {
              command: process.execPath,
              args: ['--mcp-server'],
              env: {
                SCIPAPER_MCP_CLIENT: 'Claude Code',
              },
            },
          },
        },
        null,
        2,
      ),
    },
  };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: '#f4ecde',
    autoHideMenuBar: true,
    title: 'SciPaper Todo',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
    window.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

function wrapStateMutation(handler) {
  return async (...args) => {
    await handler(...args);
    return loadState();
  };
}

function broadcastStateChanged() {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send('state:changed');
    }
  }
}

function startDatabaseWatch() {
  fs.watchFile(
    DATABASE_PATH,
    { interval: 1200 },
    (current, previous) => {
      if (current.mtimeMs !== previous.mtimeMs) {
        broadcastStateChanged();
      }
    },
  );
}

function registerIpc() {
  ipcMain.handle('app:bootstrap', async () => loadState());
  ipcMain.handle('app:getMcpInfo', async () => buildMcpInfo());

  ipcMain.handle(
    'article:create',
    wrapStateMutation(async (_event, payload) => {
      createArticle(payload);
    }),
  );
  ipcMain.handle(
    'article:updateMeta',
    wrapStateMutation(async (_event, { articleId, patch }) => {
      updateArticleMeta(articleId, patch);
    }),
  );
  ipcMain.handle(
    'article:updateResearchContext',
    wrapStateMutation(async (_event, { articleId, researchContext }) => {
      updateResearchContext(articleId, researchContext);
    }),
  );
  ipcMain.handle(
    'block:addText',
    wrapStateMutation(async (_event, { articleId, sectionType, content, description }) => {
      addTextBlock(articleId, sectionType, content, description);
    }),
  );
  ipcMain.handle(
    'block:updateText',
    wrapStateMutation(async (_event, { articleId, blockId, content, description }) => {
      updateTextBlockWithStreak(articleId, blockId, content, description);
    }),
  );
  ipcMain.handle(
    'block:delete',
    wrapStateMutation(async (_event, { articleId, blockId }) => {
      deleteBlock(articleId, blockId);
    }),
  );
  ipcMain.handle(
    'block:importAsset',
    wrapStateMutation(async (event, { articleId, sectionType, kind }) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      const filters =
        kind === 'image'
          ? [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tif', 'tiff'] }]
          : [{ name: 'Files', extensions: ['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'txt', '*'] }];
      const dialogResult = await dialog.showOpenDialog(browserWindow, {
        title: kind === 'image' ? '选择图片附件' : '选择外部文件',
        properties: ['openFile', 'multiSelections'],
        filters,
      });

      if (dialogResult.canceled) {
        return;
      }

      for (const filePath of dialogResult.filePaths) {
        addAssetBlock(articleId, sectionType, kind, filePath);
      }
    }),
  );
  ipcMain.handle('block:openAsset', async (_event, { articleId, blockId }) => {
    const resolvedPath = openPathForBlock(articleId, blockId);

    if (!resolvedPath) {
      return false;
    }

    await shell.openPath(resolvedPath);
    return true;
  });
  ipcMain.handle('block:getPreview', async (_event, { articleId, blockId }) => {
    const payload = getPreviewPayload(articleId, blockId);

    if (payload.previewKind === 'tiff' || payload.previewKind === 'pdf') {
      try {
        return {
          ...payload,
          bufferBase64: fs.readFileSync(payload.path).toString('base64'),
        };
      } catch {
        return { ...payload, error: 'File not found or unreadable' };
      }
    }

    return payload;
  });
  ipcMain.handle('article:openFolder', async (_event, { articleId }) => {
    await shell.openPath(getArticleDirectory(articleId));
    return true;
  });
  ipcMain.handle(
    'review:addRound',
    wrapStateMutation(async (_event, { articleId, payload }) => {
      addReviewRound(articleId, payload);
    }),
  );
  ipcMain.handle(
    'review:addComment',
    wrapStateMutation(async (_event, { articleId, roundId, payload }) => {
      addReviewComment(articleId, roundId, payload);
    }),
  );
  ipcMain.handle(
    'review:updateCommentStatus',
    wrapStateMutation(async (_event, { articleId, roundId, commentId, status }) => {
      updateReviewCommentStatus(articleId, roundId, commentId, status);
    }),
  );
  ipcMain.handle(
    'review:addRevision',
    wrapStateMutation(async (_event, { articleId, roundId, commentId, payload }) => {
      addRevision(articleId, roundId, commentId, payload);
    }),
  );
  ipcMain.handle('article:exportMarkdown', async (_event, { articleId }) => {
    const exportPath = exportMarkdown(articleId);
    await shell.showItemInFolder(exportPath);
    return exportPath;
  });
  ipcMain.handle('article:getWritingGuidance', async (_event, { articleId, targetSection }) =>
    getWritingGuidance(articleId, targetSection),
  );

  // Thesis operations
  ipcMain.handle(
    'thesis:create',
    wrapStateMutation(async (_event, payload) => {
      createThesis(payload);
    }),
  );

  ipcMain.handle(
    'thesis:updateMeta',
    wrapStateMutation(async (_event, { thesisId, patch }) => {
      updateThesisMeta(thesisId, patch);
    }),
  );

  ipcMain.handle(
    'thesis:addSection',
    wrapStateMutation(async (_event, { thesisId, sectionType, title }) => {
      addThesisSection(thesisId, sectionType, title);
    }),
  );

  ipcMain.handle(
    'thesis:linkArticle',
    wrapStateMutation(async (_event, { thesisId, articleId }) => {
      linkArticleToThesis(thesisId, articleId);
    }),
  );

  ipcMain.handle(
    'thesis:unlinkArticle',
    wrapStateMutation(async (_event, { thesisId, articleId }) => {
      unlinkArticleFromThesis(thesisId, articleId);
    }),
  );

  // Writing streak operations
  ipcMain.handle('streak:get', async () => {
    const state = loadState();
    return state.writingStreak;
  });

  ipcMain.handle(
    'streak:updateGoal',
    wrapStateMutation(async (_event, { goal }) => {
      updateDailyGoal(goal);
    }),
  );

  // Mood tracking operations
  ipcMain.handle(
    'mood:add',
    wrapStateMutation(async (_event, { mood, note }) => {
      addMoodEntry(mood, note);
    }),
  );

  ipcMain.handle('mood:getHistory', async () => {
    return getMoodHistory();
  });

  // Pomodoro operations
  ipcMain.handle(
    'pomodoro:addSession',
    wrapStateMutation(async (_event, { duration, articleId, sectionType }) => {
      addPomodoroSession(duration, articleId, sectionType);
    }),
  );

  ipcMain.handle('pomodoro:getStats', async () => {
    return getPomodoroStats();
  });

  // Theme operations
  ipcMain.handle('theme:get', async () => {
    return getTheme();
  });

  ipcMain.handle(
    'theme:set',
    wrapStateMutation(async (_event, { theme }) => {
      setTheme(theme);
    }),
  );

  // Writing stats
  ipcMain.handle('stats:get', async () => {
    return getWritingStats();
  });

  // Tag operations
  ipcMain.handle(
    'tag:add',
    wrapStateMutation(async (_event, { articleId, tagName, tagColor }) => {
      addTag(articleId, tagName, tagColor);
    }),
  );

  ipcMain.handle(
    'tag:remove',
    wrapStateMutation(async (_event, { articleId, tagId }) => {
      removeTag(articleId, tagId);
    }),
  );
}

async function startApplication() {
  app.setName('SciPaper Todo');

  if (isMcpMode) {
    await startMcpServer();
    return;
  }

  loadState();
  registerIpc();
  startDatabaseWatch();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

app.whenReady().then(startApplication).catch((error) => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !isMcpMode) {
    app.quit();
  }
});

app.on('before-quit', () => {
  fs.unwatchFile(DATABASE_PATH);
});
