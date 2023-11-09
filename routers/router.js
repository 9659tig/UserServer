module.exports = function (app) {
    const video = require('../controller/videoController');
    const clip = require('../controller/clipController');
    const influencer = require('../controller/influencerController');
    const product = require('../controller/productController');

    // 인플루언서 정보 조회
    app.get('/influencer/:channelId', influencer.getInfluencer)

    // 비디오 정보 조회
    app.get('/videos/:channelId', video.getVideos);

    // 비디오 내 클립 목록 조회
    app.get('/clips/:videoId', clip.getClips);

    // 클립 내 상품 목록 조회
    app.get('/products', product.getProducts)

    // 인플루언서 스토어 조회
    app.get('/products/:channelId', product.getProductsByInfluencer)

};