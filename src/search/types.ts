export interface ProductDocument {
  id: string;              // clipLink (DynamoDB PK)
  productName: string;
  productBrand: string;
  productDeepLink: string;
  productImages: string;
  productPrice: number;
  metaInfo: string;
  channelId: string;
  clipLink: string;
  videoId: string;
  views: number;
  purchases: number;
  category?: string;
  embedding_gemini?: number[];
  embedding_openai?: number[];
}

export interface InfluencerDocument {
  id: string;              // channelId (DynamoDB PK)
  channelId: string;
  channelName: string;
  channelProfile: string;
  subscriberCount: number;
  category?: string;
  embedding_gemini?: number[];
  embedding_openai?: number[];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  keywordScore: number;
  semanticScore: number;
}

export interface SearchOptions {
  limit?: number;          // 기본값 20
  alpha?: number;          // 키워드 가중치 override
  beta?: number;           // 시맨틱 가중치 override
}

export type SearchEntity = 'product' | 'influencer';
export type SyncOperation = 'upsert' | 'delete';

export interface SyncRequest {
  entity: SearchEntity;
  operation: SyncOperation;
  item: Record<string, any>;
}

export interface SyncResponse {
  success: boolean;
  message: string;
}

// Phase 2 준비: 검색 이벤트 타입
export interface SearchEvent {
  type: 'search' | 'click' | 'purchase';
  query?: string;
  resultCount?: number;
  latencyMs?: number;
  clickedProductId?: string;
  rank?: number;
  timestamp: number;
}

export type SearchReadiness = 'loading' | 'keyword_only' | 'ready';
