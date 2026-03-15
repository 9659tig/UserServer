import OpenAI from 'openai';
import { EmbeddingProvider } from './EmbeddingProvider';

export class OpenAIProvider implements EmbeddingProvider {
  readonly name = 'openai';
  readonly dimensions = 1536;
  private client: OpenAI;
  private model: string = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    });
    return response.data.map(d => d.embedding);
  }
}
