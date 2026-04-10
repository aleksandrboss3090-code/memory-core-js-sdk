# Memory Core SDK (JavaScript)

Universal memory engine for AI bots. 3 layers: Redis (Hot) + Qdrant (Warm) + Neo4j (Cold).

**FZ-152 compliant** — all personal data stored in Russia.

## Install

```bash
npm install memorycore-ai
```

## Quick Start

```javascript
const { MemoryClient } = require('memorycore-ai');

const memory = new MemoryClient('mc_live_...');

// Save
await memory.upsert('user_42', 'Loves Italian food');

// Recall
const ctx = await memory.context('user_42', 'what to order for dinner?');
console.log(ctx.warm_episodes);
```

## TypeScript

```typescript
import { MemoryClient, UsageResponse } from 'memorycore-ai';

const memory = new MemoryClient('mc_live_...', { botId: 'my-bot' });

const usage: UsageResponse = await memory.usage();
console.log(`Used: ${usage.used}/${usage.limit}`);
```

## API Methods

### Core

| Method | Description |
|--------|-------------|
| `upsert(userId, content, opts?)` | Save to memory |
| `context(userId, query, opts?)` | Retrieve relevant context |
| `remember(userId, fact)` | Shortcut: save a fact |
| `recall(userId, query)` | Shortcut: semantic search |
| `summarize(userId)` | Summarize session |
| `profile(userId)` | User profile |
| `health()` | API health check |

### New in v0.4.2

| Method | Description |
|--------|-------------|
| `search(userId, query, opts?)` | Semantic search with filters |
| `delete(userId, opts?)` | Delete memory entries |
| `usage()` | API usage & rate limits |
| `exportData(userId)` | Export user data (GDPR/FZ-152) |
| `importData(userId, records)` | Bulk import records |
| `regenerateKey()` | Regenerate API key |

### Soft Delete (v0.5.0)

| Method | Description |
|--------|-------------|
| `forget(episodeId?, userId?, opts?)` | Soft delete with 30-day retention |
| `trash(userId, limit?)` | View trash (soft-deleted records) |
| `restore(opts)` | Restore from trash |
| `purge(userId, forceAll?)` | Permanently delete (IRREVERSIBLE) |

## Examples

### Search

```javascript
const results = await memory.search('user_42', 'Italian food', {
  limit: 5,
  memoryType: 'fact'
});
```

### Check Usage

```javascript
const usage = await memory.usage();
console.log(`Plan: ${usage.plan}, Used: ${usage.used}/${usage.limit}`);
```

### Delete

```javascript
// Delete specific entry
await memory.delete('user_42', { memoryId: 'uuid-here' });

// Delete ALL user data
await memory.delete('user_42', { deleteAll: true });
```

## 🗑️ Soft Delete (v0.5.0)

Soft Delete provides a safety net — records are moved to trash with 30-day retention before permanent deletion.

### Soft Delete a Record

```javascript
// Soft delete a specific record (moves to trash)
await memory.forget('episode-uuid-here');

// Soft delete all user records
await memory.forget(null, 'user_42');
```

### View Trash

```javascript
// See what's in trash (up to 30 days retention)
const trash = await memory.trash('user_42');
console.log(`In trash: ${trash.total_in_trash} records`);

trash.trash.forEach(item => {
  console.log(`- ${item.id}: ${item.days_remaining} days until auto-purge`);
});
```

### Restore from Trash

```javascript
// Restore specific records
await memory.restore({
  episodeIds: ['uuid-1', 'uuid-2', 'uuid-3']
});

// Restore ALL deleted records for user
await memory.restore({
  userId: 'user_42'
});
```

### Permanently Delete (IRREVERSIBLE!)

```javascript
// Purge only records older than 30 days
await memory.purge('user_42');

// Purge ALL (including recent) — use with caution!
await memory.purge('user_42', { forceAll: true });
```

## Links

- **Landing**: https://memorycore.ru
- **API Docs**: https://api.memorycore.ru/docs
- **Python SDK**: https://pypi.org/project/memorycore-ai/

## License

MIT - (c) 2025-2026 Otel Group
