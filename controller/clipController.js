const clipService = require('../service/clipService')
const resStatus = require('../config/response')
exports.getClips = async(req,res)=>{
    try{
        const videoID = req.params.videoId;
        if(!videoID)
            return res.status(400).send(resStatus.VIDEOID_EMPTY);

        const clipList = await clipService.getClipInfo(videoID)
        return res.send(clipList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.CLIP_DB_ERR);
    }
}