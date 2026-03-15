import { KeywordSearchEngine } from '../../../src/search/engine/KeywordSearchEngine';

const sampleProducts = [
  { id: '1', productName: '나이키 에어맥스', productBrand: '나이키', metaInfo: '운동화 스포츠' },
  { id: '2', productName: '아디다스 울트라부스트', productBrand: '아디다스', metaInfo: '러닝화' },
  { id: '3', productName: '보습 수분크림', productBrand: '이니스프리', metaInfo: '스킨케어 보습' },
];

describe('KeywordSearchEngine', () => {
  let engine: KeywordSearchEngine;

  beforeAll(async () => {
    engine = new KeywordSearchEngine();
    await engine.indexProducts(sampleProducts);
  });

  it('should find products by name', async () => {
    const results = await engine.searchProducts('나이키');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('1');
  });

  it('should find products by brand', async () => {
    const results = await engine.searchProducts('아디다스');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('2');
  });

  it('should find products by meta info', async () => {
    const results = await engine.searchProducts('보습');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty for no match', async () => {
    const results = await engine.searchProducts('존재하지않는상품');
    expect(results).toHaveLength(0);
  });

  it('should support adding and removing a document', async () => {
    await engine.addProduct({ id: '4', productName: '뉴발란스 993', productBrand: '뉴발란스', metaInfo: '클래식' });
    let results = await engine.searchProducts('뉴발란스');
    expect(results.length).toBeGreaterThan(0);

    engine.removeProduct('4');
    results = await engine.searchProducts('뉴발란스');
    expect(results).toHaveLength(0);
  });

  it('should find products by chosung search', async () => {
    const results = await engine.searchProducts('ㄴㅇㅋ');
    // '나이키'의 초성 'ㄴㅇㅋ'로 검색 가능해야 함
    expect(results.length).toBeGreaterThan(0);
  });
});
