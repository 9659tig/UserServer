// src/search/searchContext.ts
import { InMemoryStore } from './store/InMemoryStore';
import { KeywordSearchEngine } from './engine/KeywordSearchEngine';
import { SemanticSearchEngine } from './engine/SemanticSearchEngine';
import { HybridSearchEngine } from './engine/HybridSearchEngine';
import { EmbeddingRouter } from './embedding/EmbeddingRouter';
import { SyncHandler } from './store/SyncHandler';
import { ConsoleSearchEventLogger, SearchEventEmitter } from './events/SearchEventLogger';
import { GeminiProvider } from './embedding/GeminiProvider';
import { OpenAIProvider } from './embedding/OpenAIProvider';
import { SEARCH_CONFIG } from '../config/secret';
import { EmbeddingProvider } from './embedding/EmbeddingProvider';

// 검색 엔진 인스턴스들
export const store = new InMemoryStore();
export const keywordEngine = new KeywordSearchEngine();
export const semanticEngine = new SemanticSearchEngine();

// 임베딩 프로바이더
const providers: Record<string, EmbeddingProvider> = {};
if (SEARCH_CONFIG.GEMINI_API_KEY) {
  providers.gemini = new GeminiProvider(SEARCH_CONFIG.GEMINI_API_KEY);
}
if (SEARCH_CONFIG.OPENAI_API_KEY) {
  providers.openai = new OpenAIProvider(SEARCH_CONFIG.OPENAI_API_KEY);
}

// 프로바이더가 없으면 keyword-only 모드
let embeddingRouter: EmbeddingRouter | null = null;
if (Object.keys(providers).length > 0) {
  const defaultProvider = providers[SEARCH_CONFIG.EMBEDDING_PROVIDER]
    ? SEARCH_CONFIG.EMBEDDING_PROVIDER
    : Object.keys(providers)[0];
  embeddingRouter = new EmbeddingRouter(providers, defaultProvider);
}

export { embeddingRouter };

// 하이브리드 검색 엔진 (임베딩 없으면 keyword-only로 동작)
export const hybridEngine = new HybridSearchEngine(
  keywordEngine,
  semanticEngine,
  embeddingRouter || { name: 'none', dimensions: 0, embed: async () => [], embedBatch: async () => [] },
  SEARCH_CONFIG.SEARCH_ALPHA,
  SEARCH_CONFIG.SEARCH_BETA,
);

// 동기화 핸들러
export const syncHandler = new SyncHandler(
  store, keywordEngine, semanticEngine,
  embeddingRouter || { name: 'none', dimensions: 0, embed: async () => [], embedBatch: async () => [] },
);

// 이벤트 로거 (Phase 2 준비)
export const eventLogger: SearchEventEmitter = new ConsoleSearchEventLogger();
