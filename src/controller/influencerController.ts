import { Request, Response } from 'express';
import resStatus from '../config/response'
import { getInfluencerInfo } from '../service/InfluencerService'

export const getInfluencer = async(req: Request, res: Response)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const influencerInfo = await getInfluencerInfo(channelID)
        if (!influencerInfo) return res.status(400).send(resStatus.INFLUENCER_EMPTY)
        return res.send(influencerInfo)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.INFLUENCER_DB_ERR);
    }
}