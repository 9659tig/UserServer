module.exports = {

    CHANNELID_EMPTY : { result: false, error: '입력 형식 에러', message: 'channel Id값이 없습니다.' },
    VIDEOID_EMPTY : { result: false, error: '입력 형식 에러', message: 'video Id값이 없습니다.' },

    VIDEO_DB_ERR : {result: false, error: "DB 에러", message:"비디오 목록 정보를 가져오지 못했습니다."},
    CLIP_DB_ERR : {result: false, error: "DB 에러", message:"클립 목록 정보를 가져오지 못했습니다."},
    INFLUENCER_DB_ERR : {result: false, error: "DB 에러", message:"인플루언서 정보를 가져오지 못했습니다."},

    INFLUENCER_EMPTY : {result: false, error: "데이터 없음", message:"해당 인플루언서의 정보가 없습니다"},
}