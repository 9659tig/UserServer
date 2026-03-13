import { EmbeddingRouter } from '../../../src/search/embedding/EmbeddingRouter';
import { EmbeddingProvider } from '../../../src/search/embedding/EmbeddingProvider';

const mockProvider = (name: string, dims: number): EmbeddingProvider => ({
  name,
  dimensions: dims,
  embed: jest.fn().mockResolvedValue(new Array(dims).fill(0.1)),
  embedBatch: jest.fn().mockResolvedValue([new Array(dims).fill(0.1)]),
});

describe('EmbeddingRouter', () => {
  it('should use the active provider', async () => {
    const gemini = mockProvider('gemini', 768);
    const openai = mockProvider('openai', 1536);
    const router = new EmbeddingRouter({ gemini, openai }, 'gemini');

    await router.embed('test');
    expect(gemini.embed).toHaveBeenCalledWith('test');
    expect(openai.embed).not.toHaveBeenCalled();
  });

  it('should switch provider and expose correct dimensions', async () => {
    const gemini = mockProvider('gemini', 768);
    const openai = mockProvider('openai', 1536);
    const router = new EmbeddingRouter({ gemini, openai }, 'gemini');

    expect(router.dimensions).toBe(768);
    router.switchProvider('openai');
    expect(router.dimensions).toBe(1536);

    await router.embed('test');
    expect(openai.embed).toHaveBeenCalledWith('test');
  });

  it('should throw on unknown provider', () => {
    const gemini = mockProvider('gemini', 768);
    const router = new EmbeddingRouter({ gemini }, 'gemini');
    expect(() => router.switchProvider('unknown')).toThrow();
  });

  it('should return active provider name', () => {
    const gemini = mockProvider('gemini', 768);
    const router = new EmbeddingRouter({ gemini }, 'gemini');
    expect(router.getActiveProviderName()).toBe('gemini');
  });
});
