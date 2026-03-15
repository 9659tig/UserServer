import { KoreanTokenizer } from '../../../src/search/tokenizer/KoreanTokenizer';

// mecab binary가 설치되어 있는지 확인
async function isMecabAvailable(): Promise<boolean> {
  const tokenizer = new KoreanTokenizer();
  const tokens = await tokenizer.tokenize('테스트');
  // mecab이 있으면 형태소 분석 결과가 나오고, 없으면 fallback으로 원본 그대로 반환
  // 단일 단어이므로 두 경우 모두 길이 1이지만, 내부 플래그로 판단
  return tokenizer.isMecabReady();
}

describe('KoreanTokenizer', () => {
  let tokenizer: KoreanTokenizer;
  let mecabAvailable: boolean;

  beforeAll(async () => {
    tokenizer = new KoreanTokenizer();
    mecabAvailable = await isMecabAvailable();
  });

  describe('tokenize', () => {
    if (process.env.MECAB_INSTALLED === 'true') {
      it('should tokenize Korean text with mecab', async () => {
        const tokens = await tokenizer.tokenize('보습크림을 추천해주세요');
        expect(tokens.length).toBeGreaterThan(1);
        expect(tokens).toContain('보습');
        expect(tokens).toContain('크림');
        // 조사 '을'은 제거되어야 함
        expect(tokens).not.toContain('을');
      });
    }

    it('should tokenize text (fallback: whitespace split)', async () => {
      const tokens = await tokenizer.tokenize('보습크림을 추천해주세요');
      expect(tokens.length).toBeGreaterThan(0);
      // fallback에서는 공백 기준 분리
      if (!mecabAvailable) {
        expect(tokens).toContain('보습크림을');
        expect(tokens).toContain('추천해주세요');
      }
    });

    it('should tokenize English text (lowercase)', async () => {
      const tokens = await tokenizer.tokenize('Nike Shoes');
      expect(tokens).toContain('nike');
      expect(tokens).toContain('shoes');
    });

    it('should handle empty string', async () => {
      const tokens = await tokenizer.tokenize('');
      expect(tokens).toEqual([]);
    });

    it('should handle whitespace-only string', async () => {
      const tokens = await tokenizer.tokenize('   ');
      expect(tokens).toEqual([]);
    });
  });

  describe('tokenizeSync', () => {
    it('should split by whitespace and lowercase', () => {
      const tokens = tokenizer.tokenizeSync('Nike Shoes');
      expect(tokens).toContain('nike');
      expect(tokens).toContain('shoes');
    });

    it('should handle empty string', () => {
      const tokens = tokenizer.tokenizeSync('');
      expect(tokens).toEqual([]);
    });
  });

  describe('isNaturalLanguage', () => {
    it('should detect natural language sentence', async () => {
      // 길이 >= 6, 공백 포함
      expect(await tokenizer.isNaturalLanguage('보습력 좋은 크림 추천해줘')).toBe(true);
    });

    it('should reject short keyword', async () => {
      expect(await tokenizer.isNaturalLanguage('크림')).toBe(false);
    });

    it('should reject short text without spaces', async () => {
      expect(await tokenizer.isNaturalLanguage('보습크림')).toBe(false);
    });

    it('should reject empty string', async () => {
      expect(await tokenizer.isNaturalLanguage('')).toBe(false);
    });
  });

  describe('extractChosung', () => {
    it('should extract chosung from Korean text', () => {
      const chosung = tokenizer.extractChosung('보습크림');
      expect(chosung).toBe('ㅂㅅㅋㄹ');
    });

    it('should handle mixed Korean and English', () => {
      const chosung = tokenizer.extractChosung('나이키Nike');
      // es-hangul의 getChoseong은 한글만 초성 추출, 영문은 그대로
      expect(chosung).toContain('ㄴㅇㅋ');
    });

    it('should handle empty string', () => {
      const chosung = tokenizer.extractChosung('');
      expect(chosung).toBe('');
    });
  });
});
