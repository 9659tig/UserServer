import { SemanticSearchEngine } from '../../../src/search/engine/SemanticSearchEngine';

describe('SemanticSearchEngine', () => {
  let engine: SemanticSearchEngine;

  beforeEach(() => {
    engine = new SemanticSearchEngine();
  });

  it('should index and search by cosine similarity', () => {
    engine.indexVectors('product_gemini', [
      { id: '1', embedding: [1, 0, 0] },
      { id: '2', embedding: [0, 1, 0] },
      { id: '3', embedding: [0.9, 0.1, 0] },
    ]);

    const results = engine.search('product_gemini', [1, 0, 0], 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[0].score).toBeCloseTo(1.0);
    expect(results[1].id).toBe('3');
  });

  it('should maintain separate indices per provider', () => {
    engine.indexVectors('product_gemini', [{ id: '1', embedding: [1, 0, 0] }]);
    engine.indexVectors('product_openai', [{ id: '1', embedding: [0, 1, 0, 0] }]);

    const geminiResults = engine.search('product_gemini', [1, 0, 0], 5);
    expect(geminiResults[0].score).toBeCloseTo(1.0);

    const openaiResults = engine.search('product_openai', [0, 1, 0, 0], 5);
    expect(openaiResults[0].score).toBeCloseTo(1.0);
  });

  it('should upsert and remove vectors', () => {
    engine.indexVectors('product_gemini', [{ id: '1', embedding: [1, 0, 0] }]);
    engine.upsertVector('product_gemini', { id: '2', embedding: [0, 1, 0] });
    expect(engine.search('product_gemini', [0, 1, 0], 5)[0].id).toBe('2');

    engine.removeVector('product_gemini', '2');
    const results = engine.search('product_gemini', [0, 1, 0], 5);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should return empty for unknown index', () => {
    expect(engine.search('unknown', [1, 0], 5)).toHaveLength(0);
  });
});
