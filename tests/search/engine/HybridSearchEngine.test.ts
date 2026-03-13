import { HybridSearchEngine } from '../../../src/search/engine/HybridSearchEngine';
import { KeywordSearchEngine } from '../../../src/search/engine/KeywordSearchEngine';
import { SemanticSearchEngine } from '../../../src/search/engine/SemanticSearchEngine';
import { EmbeddingProvider } from '../../../src/search/embedding/EmbeddingProvider';

const mockProvider: EmbeddingProvider = {
  name: 'mock',
  dimensions: 3,
  embed: jest.fn().mockResolvedValue([1, 0, 0]),
  embedBatch: jest.fn().mockResolvedValue([[1, 0, 0], [0, 1, 0]]),
};

const sampleProducts = [
  { id: '1', productName: '나이키 에어맥스', productBrand: '나이키', metaInfo: '운동화' },
  { id: '2', productName: '보습 수분크림', productBrand: '이니스프리', metaInfo: '스킨케어' },
];

const sampleVectors = [
  { id: '1', embedding: [1, 0, 0] },
  { id: '2', embedding: [0, 1, 0] },
];

describe('HybridSearchEngine', () => {
  let engine: HybridSearchEngine;

  beforeEach(async () => {
    const keyword = new KeywordSearchEngine();
    await keyword.indexProducts(sampleProducts);

    const semantic = new SemanticSearchEngine();
    semantic.indexVectors('product_mock', sampleVectors);

    engine = new HybridSearchEngine(keyword, semantic, mockProvider, 0.4, 0.6);
  });

  it('should return hybrid results with keyword and semantic scores', async () => {
    const results = await engine.searchProducts('나이키', { limit: 10 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('keywordScore');
    expect(results[0]).toHaveProperty('semanticScore');
  });

  it('should respect custom alpha/beta weights', async () => {
    const keywordHeavy = await engine.searchProducts('나이키', { alpha: 1.0, beta: 0.0 });
    expect(keywordHeavy[0].semanticScore).toBe(0); // beta=0이면 시맨틱 스킵
  });

  it('should fallback to semantic-only when keyword returns nothing', async () => {
    const results = await engine.searchProducts('zzz없는키워드', { limit: 10 });
    // 키워드 0건이어도 시맨틱으로 결과 반환
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].keywordScore).toBe(0);
    expect(results[0].semanticScore).toBeGreaterThan(0);
  });
});
