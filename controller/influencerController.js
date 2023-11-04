const influencerService = require('../service/InfluencerService')
const resStatus = require('../config/response')
exports.getInfluencer = async(req,res)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const influencerInfo = await influencerService.getInfluencer(channelID)
        if (!influencerInfo) return res.status(400).send(resStatus.INFLUENCER_EMPTY)
        return res.send(influencerInfo)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.INFLUENCER_DB_ERR);
    }
}