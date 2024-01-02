import { Request, Response } from 'express';
import resStatus from '../config/response'
import { getStores, getInfluencersByChannelname, getInfluencersByChanneid } from '../utils/search';
import * as videoService from '../service/videoService'

export const getInfluencer = async(req: Request, res: Response)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const influencerInfo = await getInfluencersByChanneid(channelID)
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

        const influencers = await getInfluencersByChannelname(channelName);

        const searchRes = []
        for (const influencer of influencers) {
            const originStores = await getStores(influencer.channelId);
            const stores = originStores.map((store: any) => {
                return {
                    productDeepLink: store.productDeepLink,
                    productImage: store.productImage,
                    productBrand: store.productBrand,
                    productPrice: store.productPrice,
                    productName: store.productName,
                    purchaseCnt: store.purchaseCnt,
                    views: store.views
                }
            });
            const videoList = await videoService.getVideoInfo(influencer.channelId)

            const searchInfo = createSearchInfo(influencer.channelName, influencer.channelProfile, influencer.subscriberCount, stores, videoList)
            searchRes.push(searchInfo)
        }

        return res.send(searchRes)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.INFLUENCER_DB_ERR);
    }
}

