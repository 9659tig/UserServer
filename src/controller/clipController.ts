import { getClipInfo } from '../service/clipService';
import { Request, Response } from 'express';
import resStatus from '../config/response'

export const getClips = async(req: Request, res: Response)=>{
    try{
        const videoID = req.params.videoId;
        if(!videoID)
            return res.status(400).send(resStatus.VIDEOID_EMPTY);

        const clipList = await getClipInfo(videoID)
        return res.send(clipList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.CLIP_DB_ERR);
    }
}