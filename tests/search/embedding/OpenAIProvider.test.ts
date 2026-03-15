import { OpenAIProvider } from '../../../src/search/embedding/OpenAIProvider';

describe('OpenAIProvider', () => {
  const provider = new OpenAIProvider(process.env.OPENAI_API_KEY || 'dummy');

  it('should have correct metadata', () => {
    expect(provider.name).toBe('openai');
    expect(provider.dimensions).toBe(1536);
  });

  const itIfKey = process.env.OPENAI_API_KEY ? it : it.skip;

  itIfKey('should embed a single text', async () => {
    const result = await provider.embed('보습 크림 추천');
    expect(result).toHaveLength(1536);
  }, 10000);

  itIfKey('should embed batch texts in a single API call', async () => {
    const results = await provider.embedBatch(['크림', '세럼']);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveLength(1536);
  }, 10000);
});
