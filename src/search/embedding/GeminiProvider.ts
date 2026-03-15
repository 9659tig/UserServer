import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingProvider } from './EmbeddingProvider';

export class GeminiProvider implements EmbeddingProvider {
  readonly name = 'gemini';
  readonly dimensions = 3072;
  private client: GoogleGenerativeAI;
  private model: string = 'gemini-embedding-001';

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async embed(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const requests = texts.map(text => ({
      content: { role: 'user' as const, parts: [{ text }] },
    }));
    const result = await model.batchEmbedContents({ requests });
    return result.embeddings.map(e => e.values);
  }
}
