import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as videoService from '../service/videoService'

export const getVideos = async(req: Request, res: Response)=>{
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