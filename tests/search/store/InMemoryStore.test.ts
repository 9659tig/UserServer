import { InMemoryStore } from '../../../src/search/store/InMemoryStore';

describe('InMemoryStore', () => {
  it('should upsert and retrieve products', () => {
    const store = new InMemoryStore();
    store.upsertProduct({
      clipLink: 'clip1', productName: '테스트 상품', productBrand: '브랜드',
      metaInfo: '메타', channelId: 'ch1', productDeepLink: 'link1',
      productImages: 'img1', productPrice: 10000, videoId: 'v1', views: 100, purchases: 10,
    });
    expect(store.getAllProducts()).toHaveLength(1);
    expect(store.getProduct('clip1')?.productName).toBe('테스트 상품');
  });

  it('should upsert and retrieve influencers', () => {
    const store = new InMemoryStore();
    store.upsertInfluencer({
      channelId: 'ch1', channelName: '뷰티채널',
      channelProfile: 'profile.jpg', subscriberCount: 1000,
    });
    expect(store.getAllInfluencers()).toHaveLength(1);
  });

  it('should delete products', () => {
    const store = new InMemoryStore();
    store.upsertProduct({
      clipLink: 'clip1', productName: 'A', productBrand: 'B',
      metaInfo: '', channelId: '', productDeepLink: '',
      productImages: '', productPrice: 0, videoId: '', views: 0, purchases: 0,
    });
    store.deleteProduct('clip1');
    expect(store.getAllProducts()).toHaveLength(0);
  });

  it('should start with loading readiness', () => {
    const store = new InMemoryStore();
    expect(store.readiness).toBe('loading');
  });
});
