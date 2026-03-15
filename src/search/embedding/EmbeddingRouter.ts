import { EmbeddingProvider } from './EmbeddingProvider';

export class EmbeddingRouter implements EmbeddingProvider {
  private providers: Record<string, EmbeddingProvider>;
  private activeProvider: EmbeddingProvider;

  constructor(providers: Record<string, EmbeddingProvider>, defaultProvider: string) {
    this.providers = providers;
    if (!providers[defaultProvider]) {
      throw new Error(`Provider "${defaultProvider}" not found. Available: ${Object.keys(providers).join(', ')}`);
    }
    this.activeProvider = providers[defaultProvider];
  }

  get name(): string { return this.activeProvider.name; }
  get dimensions(): number { return this.activeProvider.dimensions; }

  switchProvider(name: string): void {
    if (!this.providers[name]) {
      throw new Error(`Provider "${name}" not found. Available: ${Object.keys(this.providers).join(', ')}`);
    }
    this.activeProvider = this.providers[name];
  }

  getActiveProviderName(): string { return this.activeProvider.name; }
  getProvider(name: string): EmbeddingProvider | undefined { return this.providers[name]; }

  async embed(text: string): Promise<number[]> { return this.activeProvider.embed(text); }
  async embedBatch(texts: string[]): Promise<number[][]> { return this.activeProvider.embedBatch(texts); }
}
