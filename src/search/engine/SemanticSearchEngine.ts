interface VectorEntry {
  id: string;
  embedding: number[];
}

interface VectorResult {
  id: string;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class SemanticSearchEngine {
  // 인덱스명 예: product_gemini, product_openai, influencer_gemini, influencer_openai
  private indices: Map<string, VectorEntry[]> = new Map();

  indexVectors(indexName: string, entries: VectorEntry[]): void {
    this.indices.set(indexName, [...entries]);
  }

  upsertVector(indexName: string, entry: VectorEntry): void {
    const index = this.indices.get(indexName) || [];
    const existing = index.findIndex(e => e.id === entry.id);
    if (existing >= 0) index[existing] = entry;
    else index.push(entry);
    this.indices.set(indexName, index);
  }

  removeVector(indexName: string, id: string): void {
    const index = this.indices.get(indexName);
    if (!index) return;
    this.indices.set(indexName, index.filter(e => e.id !== id));
  }

  search(indexName: string, queryEmbedding: number[], limit: number = 20): VectorResult[] {
    const index = this.indices.get(indexName);
    if (!index || index.length === 0) return [];

    return index
      .map(entry => ({ id: entry.id, score: cosineSimilarity(queryEmbedding, entry.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
