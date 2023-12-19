import express, { Router } from 'express';
const router: Router = express.Router();

import * as video from '../controller/videoController'
import * as influencer from '../controller/influencerController'
import * as clip from '../controller/clipController'
import * as product from '../controller/productController'


// 인플루언서 정보 조회
router.get('/influencer/:channelId', influencer.getInfluencer)
// 인플루언서 검색
router.get('/influencers', influencer.getInfluencerByName)


// 비디오 정보 조회
router.get('/videos/:channelId', video.getVideos);
// 비디오 내 클립 목록 조회
router.get('/clips/:videoId', clip.getClips);

// 클립 내 상품 목록 조회
router.get('/products', product.getProducts)
// 인플루언서 스토어 조회
router.get('/products/:channelId', product.getProductsByInfluencer)
// 상품 검색
router.get('/products-search/:type', product.getProductsBySearch)

export default router;