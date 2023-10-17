module.exports = function (app) {
    const video = require('../controller/videoController');
    const clip = require('../controller/clipController');
    const influencer = require('../controller/influencerController')

    //인플루언서 정보 조회
    app.get('/influencer', influencer.getInfluencer)

    //인플루언서 정보 조회 - 이름으로
    // app.get('/influencer/:channelName', influencer.getInfluencerByName)

    //비디오 정보 조회
    app.get('/videos/:videoName', video.getVideos);

    //비디오 정보 조회 - 이름으로
    app.get('/videos', video.getVideosByName);

    //클립 목록 조회
    app.get('/clips', clip.getClips);

};