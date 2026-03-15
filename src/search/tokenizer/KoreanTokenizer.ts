import mecab from 'mecab-ya';
import { getChoseong } from 'es-hangul';

/**
 * mecab-ya의 pos 결과를 Promise로 래핑한다.
 * 각 요소는 [표층형, 품사태그] 형태의 배열이다.
 */
function mecabPos(text: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    mecab.pos(text, (err: Error | null, result: string[][]) => {
      if (err) reject(err);
      else resolve(result || []);
    });
  });
}

/** 제거할 품사 태그: 조사, 어미, 부호 등 */
const EXCLUDE_TAGS = new Set([
  // 조사
  'JKS', 'JKC', 'JKG', 'JKO', 'JKB', 'JKV', 'JKQ', 'JX', 'JC',
  // 어미
  'EP', 'EF', 'EC', 'ETN', 'ETM',
  // 부호
  'SF', 'SE', 'SS', 'SP', 'SO', 'SW',
]);

/** 용언 품사 접두어 */
const VERB_TAG_PREFIXES = ['VV', 'VA', 'XSV', 'XSA'];

export class KoreanTokenizer {
  private mecabReady: boolean | null = null;

  /**
   * mecab 바이너리가 사용 가능한지 반환한다.
   * 최초 tokenize 호출 후 결과가 캐시된다.
   */
  isMecabReady(): boolean {
    return this.mecabReady === true;
  }

  /**
   * mecab 형태소 분석으로 텍스트를 토큰화한다.
   * 조사, 어미, 부호를 제거하고 체언/용언 어근을 반환한다.
   * mecab 미설치 시 공백 기준 분리 fallback을 사용한다.
   */
  async tokenize(text: string): Promise<string[]> {
    const trimmed = text.trim();
    if (!trimmed) return [];

    try {
      const parsed = await mecabPos(trimmed);
      this.mecabReady = true;

      const tokens: string[] = [];
      for (const morpheme of parsed) {
        const surface = morpheme[0]?.toLowerCase().trim();
        const tag = morpheme[1];
        if (surface && tag && !EXCLUDE_TAGS.has(tag)) {
          tokens.push(surface);
        }
      }
      return tokens.length > 0 ? tokens : this.fallbackTokenize(trimmed);
    } catch {
      this.mecabReady = false;
      return this.fallbackTokenize(trimmed);
    }
  }

  /**
   * 동기 토큰화 (MiniSearch tokenize 옵션용 fallback).
   * 공백 기준 분리 + 소문자 변환.
   */
  tokenizeSync(text: string): string[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    return trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  }

  /**
   * 자연어 문장인지 판별한다.
   * 조건: 길이 >= 6자 AND 공백 포함 AND (mecab 분석 결과 용언 포함 OR mecab 미설치 시 길이 >= 10)
   */
  async isNaturalLanguage(text: string): Promise<boolean> {
    if (text.length < 6 || !text.includes(' ')) return false;

    try {
      const parsed = await mecabPos(text);
      this.mecabReady = true;
      return parsed.some(morpheme => {
        const tag = morpheme[1];
        return tag && VERB_TAG_PREFIXES.some(prefix => tag.startsWith(prefix));
      });
    } catch {
      this.mecabReady = false;
      // mecab 미설치 시 길이 기반 추정
      return text.length >= 10 && text.includes(' ');
    }
  }

  /**
   * 한글 텍스트에서 초성을 추출한다.
   */
  extractChosung(text: string): string {
    return getChoseong(text);
  }

  private fallbackTokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
  }
}
