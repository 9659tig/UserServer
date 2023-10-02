const videoService = require('../service/videoService')
const resStatus = require('../config/response')
exports.getVideos = async(req,res)=>{
    try{
        const channelId = req.query.channelID;
        if(!channelId)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const videoList = await videoService.getVideoInfo(channelId)
        return res.send(videoList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.VIDEO_DB_ERR);
    }
}