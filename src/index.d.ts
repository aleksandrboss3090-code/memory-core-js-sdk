/**
 * Memory Core SDK — TypeScript Definitions v0.4.2
 */

export interface UpsertOptions {
  botId?: string;
  memoryType?: 'message' | 'fact' | 'episode' | 'preference' | 'entity';
  sessionId?: string;
  metadata?: Record<string, any>;
  importance?: number;
}

export interface ContextOptions {
  botId?: string;
  maxItems?: number;
  includeHot?: boolean;
  includeWarm?: boolean;
  includeCold?: boolean;
  minSimilarity?: number;
}

export interface SearchOptions {
  botId?: string;
  limit?: number;
  memoryType?: string;
  minScore?: number;
}

export interface DeleteOptions {
  botId?: string;
  memoryId?: string;
  memoryType?: string;
  deleteAll?: boolean;
}

export interface ImportOptions {
  botId?: string;
}

export interface MemoryClientOptions {
  baseUrl?: string;
  botId?: string;
  timeout?: number;
}

export interface UsageResponse {
  tenant_id: string;
  plan: 'free' | 'starter' | 'pro' | 'business';
  limit: number;
  used: number;
  remaining: number;
  month: string;
  reset_at: number;
}

export interface ContextResponse {
  user_id: string;
  hot_messages: any[];
  warm_episodes: any[];
  cold_graph: Record<string, any>;
  drums: Record<string, any>;
  total_items: number;
}

export class MemoryClient {
  constructor(apiKey: string, options?: MemoryClientOptions);
  
  upsert(userId: string, content: string, opts?: UpsertOptions): Promise<any>;
  context(userId: string, query: string, opts?: ContextOptions): Promise<ContextResponse>;
  search(userId: string, query: string, opts?: SearchOptions): Promise<any>;
  delete(userId: string, opts?: DeleteOptions): Promise<any>;
  summarize(userId: string, opts?: { botId?: string; sessionId?: string }): Promise<any>;
  profile(userId: string): Promise<any>;
  stats(userId: string): Promise<any>;
  health(): Promise<any>;
  usage(): Promise<UsageResponse>;
  exportData(userId: string, format?: string): Promise<any>;
  importData(userId: string, records: any[], opts?: ImportOptions): Promise<any>;
  regenerateKey(): Promise<{ api_key: string; created_at: string }>;
  remember(userId: string, fact: string, opts?: UpsertOptions): Promise<any>;
  recall(userId: string, query: string, opts?: ContextOptions): Promise<any[]>;
}

export default MemoryClient;
