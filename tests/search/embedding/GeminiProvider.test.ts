import { GeminiProvider } from '../../../src/search/embedding/GeminiProvider';

describe('GeminiProvider', () => {
  const provider = new GeminiProvider(process.env.GEMINI_API_KEY || 'dummy');

  it('should have correct metadata', () => {
    expect(provider.name).toBe('gemini');
    expect(provider.dimensions).toBe(768);
  });

  // API 키가 있을 때만 실행되는 통합 테스트
  const itIfKey = process.env.GEMINI_API_KEY ? it : it.skip;

  itIfKey('should embed a single text', async () => {
    const result = await provider.embed('보습 크림 추천');
    expect(result).toHaveLength(768);
    expect(typeof result[0]).toBe('number');
  }, 10000);

  itIfKey('should embed batch texts using batchEmbedContents', async () => {
    const results = await provider.embedBatch(['크림', '세럼']);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveLength(768);
  }, 10000);
});
