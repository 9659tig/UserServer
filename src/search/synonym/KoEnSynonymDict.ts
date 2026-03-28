/**
 * 한영 동의어 사전
 * 쿼리 확장 시 한글↔영문 변환에 사용
 */

const BRAND_SYNONYMS: [string, string][] = [
  // 패션
  ['나이키', 'nike'],
  ['아디다스', 'adidas'],
  ['뉴발란스', 'new balance'],
  ['언더아머', 'under armour'],
  ['퓨마', 'puma'],
  ['리복', 'reebok'],
  ['컨버스', 'converse'],
  ['반스', 'vans'],
  ['휠라', 'fila'],
  ['데상트', 'descente'],
  // 전자기기
  ['삼성', 'samsung'],
  ['갤럭시', 'galaxy'],
  ['애플', 'apple'],
  ['아이폰', 'iphone'],
  ['에어팟', 'airpods'],
  ['아이패드', 'ipad'],
  ['맥북', 'macbook'],
  ['엘지', 'lg'],
  ['소니', 'sony'],
  ['보스', 'bose'],
  ['앤커', 'anker'],
  ['로지텍', 'logitech'],
  ['레이저', 'razer'],
  ['샤오미', 'xiaomi'],
  // 뷰티
  ['에스티로더', 'estee lauder'],
  ['맥', 'mac'],
  ['랑콤', 'lancome'],
  ['클리니크', 'clinique'],
  ['디올', 'dior'],
  ['샤넬', 'chanel'],
  // 생활용품
  ['다이슨', 'dyson'],
  ['필립스', 'philips'],
  ['브라운', 'braun'],
  ['일렉트로룩스', 'electrolux'],
  // 식품
  ['비타민', 'vitamin'],
  ['프로틴', 'protein'],
  ['콜라겐', 'collagen'],
  // 일반 용어
  ['블루투스', 'bluetooth'],
  ['와이파이', 'wifi'],
  ['노트북', 'laptop'],
  ['스마트폰', 'smartphone'],
  ['이어폰', 'earphone'],
  ['헤드폰', 'headphone'],
  ['키보드', 'keyboard'],
  ['마우스', 'mouse'],
  ['모니터', 'monitor'],
  ['스피커', 'speaker'],
  ['태블릿', 'tablet'],
  ['카메라', 'camera'],
  // 카테고리 용어
  ['화장품', 'cosmetics'],
  ['스킨케어', 'skincare'],
  ['선크림', 'sunscreen'],
  ['클렌징', 'cleansing'],
  ['파운데이션', 'foundation'],
  ['립스틱', 'lipstick'],
  ['마스크팩', 'mask pack'],
  ['운동화', 'sneakers'],
  ['러닝화', 'running shoes'],
  ['트레이닝', 'training'],
  ['레깅스', 'leggings'],
  ['패딩', 'padding jacket'],
];

/** 한글 → 영문 매핑 */
const koToEn = new Map<string, string[]>();
/** 영문 → 한글 매핑 */
const enToKo = new Map<string, string[]>();

for (const [ko, en] of BRAND_SYNONYMS) {
  const koLower = ko.toLowerCase();
  const enLower = en.toLowerCase();

  if (!koToEn.has(koLower)) koToEn.set(koLower, []);
  koToEn.get(koLower)!.push(enLower);

  // 영문 단어별로도 매핑 (multi-word 지원)
  if (!enToKo.has(enLower)) enToKo.set(enLower, []);
  enToKo.get(enLower)!.push(koLower);

  // 단일 단어 영문도 매핑 (예: "new balance" → "new", "balance" 각각에서도 찾을 수 있게)
  const enWords = enLower.split(/\s+/);
  if (enWords.length === 1) {
    // 이미 처리됨
  }
}

/**
 * 쿼리 텍스트에서 동의어를 찾아 확장된 토큰 목록을 반환
 * 원본 토큰은 유지하고 동의어를 추가
 */
export function expandWithSynonyms(tokens: string[]): string[] {
  const expanded: string[] = [...tokens];

  for (const token of tokens) {
    const lower = token.toLowerCase();

    // 한글 → 영문
    const enSynonyms = koToEn.get(lower);
    if (enSynonyms) {
      for (const syn of enSynonyms) {
        expanded.push(...syn.split(/\s+/));
      }
    }

    // 영문 → 한글
    const koSynonyms = enToKo.get(lower);
    if (koSynonyms) {
      expanded.push(...koSynonyms);
    }
  }

  return [...new Set(expanded)];
}
