import { SyncHandler } from '../../../src/search/store/SyncHandler';
import { InMemoryStore } from '../../../src/search/store/InMemoryStore';
import { KeywordSearchEngine } from '../../../src/search/engine/KeywordSearchEngine';
import { SemanticSearchEngine } from '../../../src/search/engine/SemanticSearchEngine';
import { EmbeddingProvider } from '../../../src/search/embedding/EmbeddingProvider';

const mockProvider: EmbeddingProvider = {
  name: 'mock', dimensions: 3,
  embed: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  embedBatch: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
};

describe('SyncHandler', () => {
  let handler: SyncHandler;
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
    handler = new SyncHandler(store, new KeywordSearchEngine(), new SemanticSearchEngine(), mockProvider);
  });

  it('should upsert a product via enqueue', async () => {
    const result = await handler.enqueue({
      entity: 'product', operation: 'upsert',
      item: { clipLink: 'c1', productName: '테스트', productBrand: 'B', metaInfo: '', channelId: '', productDeepLink: '', productImages: '', productPrice: 0, videoId: '', views: 0, purchases: 0 },
    });
    expect(result.success).toBe(true);
    expect(store.getAllProducts()).toHaveLength(1);
  });

  it('should delete a product', async () => {
    store.upsertProduct({ clipLink: 'c1', productName: 'A', productBrand: '', metaInfo: '', channelId: '', productDeepLink: '', productImages: '', productPrice: 0, videoId: '', views: 0, purchases: 0 });
    const result = await handler.enqueue({ entity: 'product', operation: 'delete', item: { clipLink: 'c1' } });
    expect(result.success).toBe(true);
    expect(store.getAllProducts()).toHaveLength(0);
  });

  it('should process concurrent requests sequentially', async () => {
    const p1 = handler.enqueue({ entity: 'product', operation: 'upsert', item: { clipLink: 'c1', productName: '1', productBrand: '', metaInfo: '', channelId: '', productDeepLink: '', productImages: '', productPrice: 0, videoId: '', views: 0, purchases: 0 } });
    const p2 = handler.enqueue({ entity: 'product', operation: 'upsert', item: { clipLink: 'c2', productName: '2', productBrand: '', metaInfo: '', channelId: '', productDeepLink: '', productImages: '', productPrice: 0, videoId: '', views: 0, purchases: 0 } });
    await Promise.all([p1, p2]);
    expect(store.getAllProducts()).toHaveLength(2);
  });
});
