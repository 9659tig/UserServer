module.exports = function (app) {
    const video = require('../controller/videoController');
    const clip = require('../controller/clipController');
    const influencer = require('../controller/influencerController')

    //인플루언서 정보 조회
    app.get('/influencer/:channelId', influencer.getInfluencer)

    //비디오 정보 조회
    app.get('/videos/:channelId', video.getVideos);

    //클립 목록 조회
    app.get('/clips/:videoId', clip.getClips);

};