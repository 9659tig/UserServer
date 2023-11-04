const videoService = require('../service/videoService')
const resStatus = require('../config/response')
exports.getVideos = async(req,res)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const videoList = await videoService.getVideoInfo(channelID)
        return res.send(videoList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.VIDEO_DB_ERR);
    }
}

exports.getVideoList = async(req,res)=>{
    try{
        const videoList = await videoService.getVideoListInfo()
        return res.send(videoList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.VIDEO_DB_ERR);
    }
}

exports.getVideosByName = async(req,res)=>{
    try{
        const videoName = req.query.videoName;
        if(!videoName)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const videoList = await videoService.getVideoInfoByName(videoName)
        return res.send(videoList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.VIDEO_DB_ERR);
    }
}