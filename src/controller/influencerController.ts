import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as videoService from '../service/videoService'
import { getInfluencerInfo } from '../service/influencerService'
import { hybridEngine, store } from '../search/searchContext';
import * as productService from '../service/productService';

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

const createSearchInfo = (name: string, profile: string, subscriber: number, store: [], videoList: any) => {
    return {
        channelName: name,
        channelProfile: profile,
        subscriberCount: subscriber,
        stores: store,
        videos: videoList
    };
}
export const getInfluencerByName = async(req: Request, res: Response)=>{
    try{
        const channelName: string = req.query.channelName as string;
        if(!channelName)
            return res.status(400).send(resStatus.CHANNELNAME_EMPTY);

        const searchResults = await hybridEngine.searchInfluencers(channelName);
        const influencers = searchResults.map(r => store.getInfluencer(r.item.id)).filter(Boolean) as any[];

        const searchRes = []
        for (const influencer of influencers) {
            const stores = await productService.getProductsByInfluencer(influencer.channelId);
            const storeList = stores.map((s: any) => {
                const { clipLink, channelId, videoId, views, purchases, ...rest } = s;
                return rest;
            });

            const videoList = await videoService.getVideoInfo(influencer.channelId)
            const searchInfo = createSearchInfo(influencer.channelName, influencer.channelProfile, influencer.subscriberCount, storeList, videoList)
            searchRes.push(searchInfo)
        }
        return res.send(searchRes)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.INFLUENCER_DB_ERR);
    }
}

