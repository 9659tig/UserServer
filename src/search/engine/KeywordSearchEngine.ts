import MiniSearch from 'minisearch';
import { KoreanTokenizer } from '../tokenizer/KoreanTokenizer';
import { expandWithSynonyms } from '../synonym/KoEnSynonymDict';

interface IndexableProduct {
  id: string;
  productName: string;
  productBrand: string;
  metaInfo: string;
}

interface IndexableInfluencer {
  id: string;
  channelName: string;
}

interface KeywordResult {
  id: string;
  score: number;
}

/**
 * 사전 토큰화 전략:
 * - mecab은 비동기이므로 MiniSearch tokenize 옵션에 직접 사용 불가
 * - 인덱싱 시: 비동기로 토큰화 -> 토큰을 공백 조인하여 _tokens 필드 생성
 * - 검색 시: 비동기로 쿼리 토큰화 -> 공백 조인하여 MiniSearch에 전달
 * - MiniSearch tokenize: 공백 분리 (이미 토큰화된 텍스트를 받으므로)
 * - 초성 검색: _chosung 필드에 초성 문자열 인덱싱
 */
export class KeywordSearchEngine {
  private productIndex: MiniSearch;
  private influencerIndex: MiniSearch;
  private tokenizer: KoreanTokenizer;

  constructor() {
    this.tokenizer = new KoreanTokenizer();
    const simpleTokenize = (text: string) => text.split(/\s+/).filter(Boolean);

    this.productIndex = new MiniSearch({
      fields: ['_tokens', '_chosung'],
      storeFields: ['id'],
      tokenize: simpleTokenize,
      searchOptions: { tokenize: simpleTokenize, prefix: true, fuzzy: 0.35 },
    });

    this.influencerIndex = new MiniSearch({
      fields: ['_tokens', '_chosung'],
      storeFields: ['id'],
      tokenize: simpleTokenize,
      searchOptions: { tokenize: simpleTokenize, prefix: true, fuzzy: 0.35 },
    });
  }

  async indexProducts(products: IndexableProduct[]): Promise<void> {
    const docs = await Promise.all(products.map(p => this.prepareProductDoc(p)));
    this.productIndex.addAll(docs);
  }

  async indexInfluencers(influencers: IndexableInfluencer[]): Promise<void> {
    const docs = await Promise.all(influencers.map(i => this.prepareInfluencerDoc(i)));
    this.influencerIndex.addAll(docs);
  }

  async addProduct(product: IndexableProduct): Promise<void> {
    const doc = await this.prepareProductDoc(product);
    this.productIndex.add(doc);
  }

  async addInfluencer(influencer: IndexableInfluencer): Promise<void> {
    const doc = await this.prepareInfluencerDoc(influencer);
    this.influencerIndex.add(doc);
  }

  removeProduct(id: string): void {
    this.productIndex.discard(id);
    this.productIndex.vacuum();
  }

  removeInfluencer(id: string): void {
    this.influencerIndex.discard(id);
    this.influencerIndex.vacuum();
  }

  async searchProducts(query: string, limit: number = 20): Promise<KeywordResult[]> {
    const tokenized = await this.tokenizeQuery(query);
    const results = this.productIndex.search(tokenized);
    return results.slice(0, limit).map((r: { id: string | number; score: number }) => ({ id: r.id as string, score: r.score }));
  }

  async searchInfluencers(query: string, limit: number = 20): Promise<KeywordResult[]> {
    const tokenized = await this.tokenizeQuery(query);
    const results = this.influencerIndex.search(tokenized);
    return results.slice(0, limit).map((r: { id: string | number; score: number }) => ({ id: r.id as string, score: r.score }));
  }

  async suggestProducts(query: string, limit: number = 7): Promise<string[]> {
    const tokenized = await this.tokenizeQuery(query);
    const suggestions = this.productIndex.autoSuggest(tokenized, {
      prefix: true,
      fuzzy: 0.1,
    });
    return suggestions
      .map((s: { suggestion: string }) => this.stripChosungTokens(s.suggestion))
      .filter(Boolean)
      .slice(0, limit);
  }

  async suggestInfluencers(query: string, limit: number = 7): Promise<string[]> {
    const tokenized = await this.tokenizeQuery(query);
    const suggestions = this.influencerIndex.autoSuggest(tokenized, {
      prefix: true,
      fuzzy: 0.1,
    });
    return suggestions
      .map((s: { suggestion: string }) => this.stripChosungTokens(s.suggestion))
      .filter(Boolean)
      .slice(0, limit);
  }

  /** 초성으로만 구성된 개별 토큰을 제거하고 나머지를 조인하여 반환 */
  private stripChosungTokens(text: string): string {
    const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
    return text
      .split(/\s+/)
      .filter(token => ![...token].every(ch => CHOSUNG.includes(ch)))
      .join(' ');
  }

  private async tokenizeQuery(query: string): Promise<string> {
    const tokens = await this.tokenizer.tokenize(query);
    const expanded = expandWithSynonyms(tokens);
    const chosung = this.tokenizer.extractChosung(query);
    return [...expanded, chosung].join(' ');
  }

  private async prepareProductDoc(p: IndexableProduct) {
    const text = `${p.productName} ${p.productBrand} ${p.metaInfo}`;
    const tokens = await this.tokenizer.tokenize(text);
    const expanded = expandWithSynonyms(tokens);
    const noSpace = p.productName.replace(/\s+/g, '');
    const chosung = this.tokenizer.extractChosung(text);
    return { id: p.id, _tokens: [...expanded, noSpace].join(' '), _chosung: chosung };
  }

  private async prepareInfluencerDoc(i: IndexableInfluencer) {
    const tokens = await this.tokenizer.tokenize(i.channelName);
    const expanded = expandWithSynonyms(tokens);
    const noSpace = i.channelName.replace(/\s+/g, '');
    const chosung = this.tokenizer.extractChosung(i.channelName);
    return { id: i.id, _tokens: [...expanded, noSpace].join(' '), _chosung: chosung };
  }
}
