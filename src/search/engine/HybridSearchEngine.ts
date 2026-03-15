import { KeywordSearchEngine } from './KeywordSearchEngine';
import { SemanticSearchEngine } from './SemanticSearchEngine';
import { EmbeddingProvider } from '../embedding/EmbeddingProvider';
import { KoreanTokenizer } from '../tokenizer/KoreanTokenizer';
import { SearchResult, SearchOptions } from '../types';

export class HybridSearchEngine {
  private keyword: KeywordSearchEngine;
  private semantic: SemanticSearchEngine;
  private embeddingProvider: EmbeddingProvider;
  private tokenizer: KoreanTokenizer;
  private defaultAlpha: number;
  private defaultBeta: number;
  private _semanticReady: boolean = true;

  constructor(
    keyword: KeywordSearchEngine,
    semantic: SemanticSearchEngine,
    embeddingProvider: EmbeddingProvider,
    defaultAlpha: number = 0.4,
    defaultBeta: number = 0.6,
  ) {
    this.keyword = keyword;
    this.semantic = semantic;
    this.embeddingProvider = embeddingProvider;
    this.tokenizer = new KoreanTokenizer();
    this.defaultAlpha = defaultAlpha;
    this.defaultBeta = defaultBeta;
  }

  setSemanticReady(ready: boolean): void {
    this._semanticReady = ready;
  }

  async searchProducts(query: string, options: SearchOptions = {}): Promise<SearchResult<{ id: string }>[]> {
    return this.hybridSearch(query, 'product', options);
  }

  async searchInfluencers(query: string, options: SearchOptions = {}): Promise<SearchResult<{ id: string }>[]> {
    return this.hybridSearch(query, 'influencer', options);
  }

  private async hybridSearch(
    query: string,
    entity: 'product' | 'influencer',
    options: SearchOptions,
  ): Promise<SearchResult<{ id: string }>[]> {
    const limit = options.limit || 20;
    const { alpha, beta } = await this.resolveWeights(query, options);

    // 1. Keyword search
    const keywordResults = entity === 'product'
      ? await this.keyword.searchProducts(query, limit * 2)
      : await this.keyword.searchInfluencers(query, limit * 2);

    const maxKS = Math.max(...keywordResults.map(r => r.score), 1);
    const keywordMap = new Map(keywordResults.map(r => [r.id, r.score / maxKS]));

    // 2. Semantic search
    const semanticMap = new Map<string, number>();
    if (this._semanticReady && beta > 0) {
      try {
        const queryEmbedding = await this.embeddingProvider.embed(query);
        const indexName = `${entity}_${this.embeddingProvider.name}`;
        const semanticResults = this.semantic.search(indexName, queryEmbedding, limit * 2);
        for (const r of semanticResults) {
          semanticMap.set(r.id, Math.max(0, r.score));
        }
      } catch (err) {
        console.error('Semantic search failed, falling back to keyword only:', err);
      }
    }

    // 3. Score fusion
    const allIds = new Set([...keywordMap.keys(), ...semanticMap.keys()]);
    const combined: SearchResult<{ id: string }>[] = [];

    for (const id of allIds) {
      const ks = keywordMap.get(id) || 0;
      const ss = semanticMap.get(id) || 0;
      combined.push({
        item: { id },
        score: alpha * ks + beta * ss,
        keywordScore: ks,
        semanticScore: ss,
      });
    }

    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, limit);
  }

  private async resolveWeights(query: string, options: SearchOptions): Promise<{ alpha: number; beta: number }> {
    if (options.alpha !== undefined && options.beta !== undefined) {
      return { alpha: options.alpha, beta: options.beta };
    }
    if (query.length <= 2) return { alpha: 0.8, beta: 0.2 };
    if (await this.tokenizer.isNaturalLanguage(query)) return { alpha: 0.2, beta: 0.8 };
    return { alpha: this.defaultAlpha, beta: this.defaultBeta };
  }
}
