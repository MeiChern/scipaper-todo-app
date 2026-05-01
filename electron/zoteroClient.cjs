const { getZoteroConfig } = require('./storage.cjs');

const REQUEST_TIMEOUT_MS = 5000;
const ZOTERO_DISABLED_ERROR = 'Zotero 未启用，请到 Settings 启用';
const ZOTERO_NETWORK_ERROR = '无法连接到 Zotero，请确保 Zotero 桌面版正在运行';
const ZOTERO_NOT_FOUND_ERROR = '未找到该 item';

function truncateText(value, maxLength) {
  if (typeof value !== 'string') return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeLimit(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function buildUrl(config, pathname, params = {}) {
  const endpoint = String(config.endpoint || 'http://localhost:23119').replace(/\/+$/, '') + '/';
  const url = new URL(pathname.replace(/^\/+/, ''), endpoint);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function makeStatusError(status) {
  const error = new Error(status === 404 ? ZOTERO_NOT_FOUND_ERROR : 'Zotero request failed: ' + status);
  error.status = status;
  return error;
}

function makeNetworkError() {
  const error = new Error(ZOTERO_NETWORK_ERROR);
  error.isNetworkError = true;
  return error;
}

async function requestJson(config, pathname, params = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(config, pathname, params), {
      headers: {
        'Zotero-API-Version': '3',
      },
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw makeStatusError(404);
    }

    if (!response.ok) {
      throw makeStatusError(response.status);
    }

    return response.json();
  } catch (error) {
    if (error.status) throw error;
    if (error.name === 'AbortError' || error instanceof TypeError) {
      throw makeNetworkError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function creatorToName(creator = {}) {
  if (typeof creator.name === 'string' && creator.name.trim()) return creator.name.trim();
  return [creator.firstName, creator.lastName].filter(Boolean).join(' ').trim();
}

function extractYear(date) {
  const match = String(date || '').match(/\b(\d{4})\b/);
  return match ? match[1] : '';
}

function simplifyItem(item = {}) {
  const data = item.data || {};

  return {
    key: item.key || data.key || '',
    title: data.title || '',
    creators: Array.isArray(data.creators) ? data.creators.map(creatorToName).filter(Boolean) : [],
    year: extractYear(data.date),
    itemType: data.itemType || '',
    abstractNote: truncateText(data.abstractNote || '', 200),
  };
}

function summarizeChild(item = {}) {
  const data = item.data || {};

  return {
    key: item.key || data.key || '',
    itemType: data.itemType || '',
    title: data.title || data.filename || '',
    filename: data.filename || '',
    contentType: data.contentType || '',
    linkMode: data.linkMode || '',
    parentItem: data.parentItem || '',
  };
}

async function withZotero(work) {
  try {
    const config = getZoteroConfig();
    if (config.enabled === false) throw new Error(ZOTERO_DISABLED_ERROR);

    const result = await work({
      endpoint: config.endpoint || 'http://localhost:23119',
      userId: config.userId || '0',
    });

    return { ok: true, result };
  } catch (error) {
    if (error.status === 404) return { ok: false, error: ZOTERO_NOT_FOUND_ERROR };
    if (error.isNetworkError) return { ok: false, error: ZOTERO_NETWORK_ERROR };
    return { ok: false, error: error.message || String(error) };
  }
}

async function searchLibrary(query, limit = 25) {
  return withZotero(async (config) => {
    const items = await requestJson(config, `/api/users/${encodeURIComponent(config.userId)}/items`, {
      q: query,
      qmode: 'titleCreatorYear',
      limit: normalizeLimit(limit, 25),
      format: 'json',
    });

    return Array.isArray(items) ? items.map(simplifyItem) : [];
  });
}

async function getItemDetails(itemKey) {
  return withZotero(async (config) => {
    const userId = encodeURIComponent(config.userId);
    const key = encodeURIComponent(itemKey);
    const item = await requestJson(config, `/api/users/${userId}/items/${key}`, { format: 'json' });
    const children = await requestJson(config, `/api/users/${userId}/items/${key}/children`, { format: 'json' });
    const data = { ...(item.data || {}) };

    data.abstractNote = truncateText(data.abstractNote, 800);
    data.extra = truncateText(data.extra, 800);
    data.children = Array.isArray(children) ? children.map(summarizeChild) : [];

    return data;
  });
}

async function listCollections() {
  return withZotero(async (config) => {
    const collections = await requestJson(config, `/api/users/${encodeURIComponent(config.userId)}/collections`, {
      format: 'json',
      limit: 100,
    });

    return Array.isArray(collections)
      ? collections.map((collection) => ({
          key: collection.key || collection.data?.key || '',
          name: collection.data?.name || '',
          parentCollection: collection.data?.parentCollection || false,
        }))
      : [];
  });
}

async function getCollectionItems(collectionKey, limit = 50) {
  return withZotero(async (config) => {
    const items = await requestJson(
      config,
      `/api/users/${encodeURIComponent(config.userId)}/collections/${encodeURIComponent(collectionKey)}/items`,
      {
        format: 'json',
        limit: normalizeLimit(limit, 50),
      },
    );

    return Array.isArray(items) ? items.map(simplifyItem) : [];
  });
}

async function getItemFulltext(itemKey) {
  return withZotero(async (config) => {
    try {
      return await requestJson(
        config,
        `/api/users/${encodeURIComponent(config.userId)}/items/${encodeURIComponent(itemKey)}/fulltext`,
        { format: 'json' },
      );
    } catch (error) {
      if (error.status === 404) {
        return { content: '', error: 'No fulltext indexed' };
      }
      throw error;
    }
  });
}

module.exports = { searchLibrary, getItemDetails, listCollections, getCollectionItems, getItemFulltext };
