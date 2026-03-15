import { InMemoryStore } from './InMemoryStore';
import { KeywordSearchEngine } from '../engine/KeywordSearchEngine';
import { SemanticSearchEngine } from '../engine/SemanticSearchEngine';
import { EmbeddingProvider } from '../embedding/EmbeddingProvider';
import { SyncRequest, SyncResponse } from '../types';

export class SyncHandler {
  private store: InMemoryStore;
  private keyword: KeywordSearchEngine;
  private semantic: SemanticSearchEngine;
  private embeddingProvider: EmbeddingProvider;
  private queue: Promise<void> = Promise.resolve();

  constructor(store: InMemoryStore, keyword: KeywordSearchEngine, semantic: SemanticSearchEngine, embeddingProvider: EmbeddingProvider) {
    this.store = store;
    this.keyword = keyword;
    this.semantic = semantic;
    this.embeddingProvider = embeddingProvider;
  }

  enqueue(request: SyncRequest): Promise<SyncResponse> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue
        .then(() => this.handle(request))
        .then(resolve)
        .catch(reject);
    });
  }

  private async handle(request: SyncRequest): Promise<SyncResponse> {
    try {
      return request.entity === 'product'
        ? await this.handleProduct(request)
        : await this.handleInfluencer(request);
    } catch (err) {
      console.error('[SyncHandler] Error:', err);
      return { success: false, message: String(err) };
    }
  }

  private async handleProduct(req: SyncRequest): Promise<SyncResponse> {
    const id = req.item.clipLink;
    if (!id) return { success: false, message: 'clipLink is required' };

    if (req.operation === 'delete') {
      this.store.deleteProduct(id);
      this.safeRemoveKeywordProduct(id);
      this.semantic.removeVector(`product_${this.embeddingProvider.name}`, id);
      return { success: true, message: `Product ${id} deleted` };
    }

    this.store.upsertProduct(req.item);
    const product = this.store.getProduct(id)!;

    this.safeRemoveKeywordProduct(id);
    await this.keyword.addProduct({ id, productName: product.productName, productBrand: product.productBrand, metaInfo: product.metaInfo });

    try {
      const text = `${product.productName} ${product.productBrand} ${product.metaInfo}`.trim();
      const embedding = await this.embeddingProvider.embed(text);
      this.semantic.upsertVector(`product_${this.embeddingProvider.name}`, { id, embedding });
    } catch (err) {
      console.error('[SyncHandler] Embedding failed for product:', id, err);
    }

    return { success: true, message: `Product ${id} upserted` };
  }

  private async handleInfluencer(req: SyncRequest): Promise<SyncResponse> {
    const id = req.item.channelId;
    if (!id) return { success: false, message: 'channelId is required' };

    if (req.operation === 'delete') {
      this.store.deleteInfluencer(id);
      this.safeRemoveKeywordInfluencer(id);
      this.semantic.removeVector(`influencer_${this.embeddingProvider.name}`, id);
      return { success: true, message: `Influencer ${id} deleted` };
    }

    this.store.upsertInfluencer(req.item);
    const influencer = this.store.getInfluencer(id)!;

    this.safeRemoveKeywordInfluencer(id);
    await this.keyword.addInfluencer({ id, channelName: influencer.channelName });

    try {
      const text = `${influencer.channelName} ${influencer.category || ''}`.trim();
      const embedding = await this.embeddingProvider.embed(text);
      this.semantic.upsertVector(`influencer_${this.embeddingProvider.name}`, { id, embedding });
    } catch (err) {
      console.error('[SyncHandler] Embedding failed for influencer:', id, err);
    }

    return { success: true, message: `Influencer ${id} upserted` };
  }

  // MiniSearch throws if discarding an ID not in the index; safe wrappers prevent that from breaking sync
  private safeRemoveKeywordProduct(id: string): void {
    try { this.keyword.removeProduct(id); } catch { /* not indexed yet */ }
  }

  private safeRemoveKeywordInfluencer(id: string): void {
    try { this.keyword.removeInfluencer(id); } catch { /* not indexed yet */ }
  }
}
