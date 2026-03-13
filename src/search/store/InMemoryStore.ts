import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { ProductDocument, InfluencerDocument, SearchReadiness } from '../types';
import { EmbeddingProvider } from '../embedding/EmbeddingProvider';
import { KeywordSearchEngine } from '../engine/KeywordSearchEngine';
import { SemanticSearchEngine } from '../engine/SemanticSearchEngine';

export class InMemoryStore {
  private products: Map<string, ProductDocument> = new Map();
  private influencers: Map<string, InfluencerDocument> = new Map();
  private _readiness: SearchReadiness = 'loading';

  get readiness(): SearchReadiness { return this._readiness; }
  setReadiness(r: SearchReadiness): void { this._readiness = r; }

  // --- Product CRUD ---
  upsertProduct(raw: Record<string, any>): void {
    const doc: ProductDocument = {
      id: raw.clipLink, clipLink: raw.clipLink,
      productName: raw.productName || '', productBrand: raw.productBrand || '',
      productDeepLink: raw.productDeepLink || '', productImages: raw.productImages || '',
      productPrice: raw.productPrice || 0, metaInfo: raw.metaInfo || '',
      channelId: raw.channelId || '', videoId: raw.videoId || '',
      views: raw.views || 0, purchases: raw.purchases || 0,
      category: raw.category,
      embedding_gemini: raw.embedding_gemini, embedding_openai: raw.embedding_openai,
    };
    this.products.set(doc.id, doc);
  }

  deleteProduct(id: string): void { this.products.delete(id); }
  getProduct(id: string): ProductDocument | undefined { return this.products.get(id); }
  getAllProducts(): ProductDocument[] { return Array.from(this.products.values()); }

  // --- Influencer CRUD ---
  upsertInfluencer(raw: Record<string, any>): void {
    const doc: InfluencerDocument = {
      id: raw.channelId, channelId: raw.channelId,
      channelName: raw.channelName || '', channelProfile: raw.channelProfile || '',
      subscriberCount: raw.subscriberCount || 0, category: raw.category,
      embedding_gemini: raw.embedding_gemini, embedding_openai: raw.embedding_openai,
    };
    this.influencers.set(doc.id, doc);
  }

  deleteInfluencer(id: string): void { this.influencers.delete(id); }
  getInfluencer(id: string): InfluencerDocument | undefined { return this.influencers.get(id); }
  getAllInfluencers(): InfluencerDocument[] { return Array.from(this.influencers.values()); }

  // --- DynamoDB Full Load ---
  async loadFromDynamoDB(dbClient: DynamoDBClient): Promise<void> {
    await this.scanTable(dbClient, 'Products', item => this.upsertProduct(item));
    await this.scanTable(dbClient, 'Influencers', item => this.upsertInfluencer(item));
    console.log(`[InMemoryStore] Loaded ${this.products.size} products, ${this.influencers.size} influencers`);
  }

  private async scanTable(dbClient: DynamoDBClient, tableName: string, handler: (item: Record<string, any>) => void): Promise<void> {
    let lastKey: Record<string, any> | undefined;
    do {
      const result = await dbClient.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey: lastKey }));
      result.Items?.forEach(item => handler(unmarshall(item)));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
  }

  // --- 키워드 인덱스 구축 ---
  async buildKeywordIndex(engine: KeywordSearchEngine): Promise<void> {
    await engine.indexProducts(this.getAllProducts().map(p => ({
      id: p.id, productName: p.productName, productBrand: p.productBrand, metaInfo: p.metaInfo,
    })));
    await engine.indexInfluencers(this.getAllInfluencers().map(i => ({
      id: i.id, channelName: i.channelName,
    })));
    this._readiness = 'keyword_only';
    console.log('[InMemoryStore] Keyword index built');
  }

  // --- 벡터 인덱스 구축 + DynamoDB 캐싱 ---
  async buildVectorIndex(
    engine: SemanticSearchEngine,
    provider: EmbeddingProvider,
    batchSize: number,
    dbClient?: DynamoDBClient,
  ): Promise<void> {
    const pName = provider.name;

    // Products
    const products = this.getAllProducts();
    const productVectors: { id: string; embedding: number[] }[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const needsEmbedding = batch.filter(p => {
        const cached = pName === 'gemini' ? p.embedding_gemini : p.embedding_openai;
        return !cached || cached.length === 0;
      });

      if (needsEmbedding.length > 0) {
        const texts = needsEmbedding.map(p => `${p.productName} ${p.productBrand} ${p.metaInfo}`.trim());
        const embeddings = await provider.embedBatch(texts);
        for (let j = 0; j < needsEmbedding.length; j++) {
          const p = needsEmbedding[j];
          if (pName === 'gemini') p.embedding_gemini = embeddings[j];
          else p.embedding_openai = embeddings[j];

          // DynamoDB에 임베딩 캐싱 write-back
          if (dbClient) {
            await this.writeEmbeddingToDynamo(dbClient, 'Products', { clipLink: p.clipLink }, pName, embeddings[j]);
          }
        }
      }

      for (const p of batch) {
        const emb = pName === 'gemini' ? p.embedding_gemini : p.embedding_openai;
        if (emb?.length) productVectors.push({ id: p.id, embedding: emb });
      }
    }
    engine.indexVectors(`product_${pName}`, productVectors);

    // Influencers
    const influencers = this.getAllInfluencers();
    const influencerVectors: { id: string; embedding: number[] }[] = [];

    for (let i = 0; i < influencers.length; i += batchSize) {
      const batch = influencers.slice(i, i + batchSize);
      const needsEmbedding = batch.filter(inf => {
        const cached = pName === 'gemini' ? inf.embedding_gemini : inf.embedding_openai;
        return !cached || cached.length === 0;
      });

      if (needsEmbedding.length > 0) {
        const texts = needsEmbedding.map(inf => `${inf.channelName} ${inf.category || ''}`.trim());
        const embeddings = await provider.embedBatch(texts);
        for (let j = 0; j < needsEmbedding.length; j++) {
          const inf = needsEmbedding[j];
          if (pName === 'gemini') inf.embedding_gemini = embeddings[j];
          else inf.embedding_openai = embeddings[j];

          if (dbClient) {
            await this.writeEmbeddingToDynamo(dbClient, 'Influencers', { channelId: inf.channelId }, pName, embeddings[j]);
          }
        }
      }

      for (const inf of batch) {
        const emb = pName === 'gemini' ? inf.embedding_gemini : inf.embedding_openai;
        if (emb?.length) influencerVectors.push({ id: inf.id, embedding: emb });
      }
    }
    engine.indexVectors(`influencer_${pName}`, influencerVectors);

    this._readiness = 'ready';
    console.log(`[InMemoryStore] Vector index built with ${pName}`);
  }

  private async writeEmbeddingToDynamo(
    dbClient: DynamoDBClient, tableName: string,
    key: Record<string, string>, providerName: string, embedding: number[],
  ): Promise<void> {
    try {
      const fieldName = `embedding_${providerName}`;
      await dbClient.send(new UpdateItemCommand({
        TableName: tableName,
        Key: marshall(key),
        UpdateExpression: `SET ${fieldName} = :emb`,
        ExpressionAttributeValues: marshall({ ':emb': embedding }),
      }));
    } catch (err) {
      console.error(`[InMemoryStore] Failed to cache embedding in ${tableName}:`, err);
    }
  }
}
