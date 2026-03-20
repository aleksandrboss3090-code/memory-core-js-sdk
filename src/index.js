/**
 * Memory Core SDK — JavaScript Client v0.4.2
 * Universal memory engine for AI bots.
 * 
 * @author Алита (Claude) для семьи Науменко
 * @product ООО «Отель Групп»
 * @see https://memorycore.ru
 */

const DEFAULT_URL = 'https://api.memorycore.ru/api/v1';

class MemoryClient {
  /**
   * @param {string} apiKey - API ключ (получите на memorycore.ru)
   * @param {Object} [options]
   * @param {string} [options.baseUrl] - URL API
   * @param {string} [options.botId] - ID бота
   * @param {number} [options.timeout] - Таймаут в мс
   */
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl || DEFAULT_URL).replace(/\/$/, '');
    this.botId = options.botId || 'default';
    this.timeout = options.timeout || 15000;
  }

  async _request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const opts = { method, headers, signal: controller.signal };
      if (body) opts.body = JSON.stringify(body);

      const resp = await fetch(url, opts);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`MemoryCore API ${resp.status}: ${text}`);
      }
      return await resp.json();
    } finally {
      clearTimeout(timer);
    }
  }

  _post(path, data) { return this._request('POST', path, data); }
  _get(path) { return this._request('GET', path); }
  _delete(path, data) { return this._request('DELETE', path, data); }

  // === CORE METHODS ===

  /**
   * Save to memory (Hot+Warm+Cold)
   * @param {string} userId
   * @param {string} content
   * @param {Object} [opts]
   */
  async upsert(userId, content, opts = {}) {
    return this._post('/memory/upsert', {
      user_id: userId,
      bot_id: opts.botId || this.botId,
      content,
      memory_type: opts.memoryType || 'message',
      session_id: opts.sessionId || null,
      metadata: opts.metadata || {},
      importance: opts.importance ?? 0.5,
    });
  }

  /**
   * Retrieve relevant context
   * @param {string} userId
   * @param {string} query
   * @param {Object} [opts]
   */
  async context(userId, query, opts = {}) {
    return this._post('/memory/context', {
      user_id: userId,
      bot_id: opts.botId || this.botId,
      query,
      max_items: opts.maxItems || 10,
      include_hot: opts.includeHot ?? true,
      include_warm: opts.includeWarm ?? true,
      include_cold: opts.includeCold ?? false,
      min_similarity: opts.minSimilarity ?? 0.4,
    });
  }

  /**
   * Semantic search (v0.4.2)
   * @param {string} userId
   * @param {string} query
   * @param {Object} [opts]
   */
  async search(userId, query, opts = {}) {
    const payload = {
      user_id: userId,
      bot_id: opts.botId || this.botId,
      query,
      limit: opts.limit || 10,
      min_score: opts.minScore ?? 0.3,
    };
    if (opts.memoryType) payload.memory_type = opts.memoryType;
    return this._post('/memory/search', payload);
  }

  /**
   * Delete memory entries (v0.4.2)
   * @param {string} userId
   * @param {Object} [opts]
   */
  async delete(userId, opts = {}) {
    const payload = {
      user_id: userId,
      bot_id: opts.botId || this.botId,
    };
    if (opts.memoryId) payload.memory_id = opts.memoryId;
    if (opts.memoryType) payload.memory_type = opts.memoryType;
    if (opts.deleteAll) payload.delete_all = true;
    return this._delete('/memory/delete', payload);
  }

  /**
   * Summarize session into episode
   */
  async summarize(userId, opts = {}) {
    return this._post('/memory/summarize', {
      user_id: userId,
      bot_id: opts.botId || this.botId,
      session_id: opts.sessionId || 'default',
    });
  }

  /** Full user profile */
  async profile(userId) {
    return this._get(`/memory/profile/${userId}`);
  }

  /** User stats */
  async stats(userId) {
    return this._get(`/memory/stats/${userId}`);
  }

  /** API health check */
  async health() {
    return this._get('/health');
  }

  // === v0.4.2 METHODS ===

  /** API usage & rate limits */
  async usage() {
    return this._get('/account/usage');
  }

  /** Export user data (GDPR/FZ-152) */
  async exportData(userId, format = 'json') {
    return this._get(`/memory/export/${userId}?format=${format}`);
  }

  /** Import records */
  async importData(userId, records, opts = {}) {
    return this._post('/memory/import', {
      user_id: userId,
      bot_id: opts.botId || this.botId,
      records,
    });
  }

  /** Regenerate API key (WARNING: old key stops working!) */
  async regenerateKey() {
    const result = await this._post('/account/regenerate-key', {});
    if (result.api_key) this.apiKey = result.api_key;
    return result;
  }

  // === SHORTCUTS ===

  /** Remember a fact */
  async remember(userId, fact, opts = {}) {
    return this.upsert(userId, fact, { ...opts, memoryType: 'fact' });
  }

  /** Recall (warm episodes only) */
  async recall(userId, query, opts = {}) {
    const ctx = await this.context(userId, query, opts);
    return ctx.warm_episodes || [];
  }
}

// CommonJS + ESM compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryClient };
  module.exports.default = MemoryClient;
}
