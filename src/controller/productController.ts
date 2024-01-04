import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as searchEngine from '../utils/search';

export const getProducts = async(req: Request, res: Response)=>{
    try{
        const clipLink: string = req.query.clipLink as string;
        if(!clipLink)
            return res.status(400).send(resStatus.CLIPLINK_EMPTY);

        const clipList = await searchEngine.getProdutsByCliplink(clipLink)
        return res.send(clipList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

export const getProductsByInfluencer = async(req: Request, res: Response)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const stores = await searchEngine.getStores(channelID);

        return res.send(stores)

    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

export const getProductsBySearch = async(req: Request, res: Response)=>{
    try{
        const type = req.params.type;
        const keyword: string = req.query.keyword as string;

        if(!type)
            return res.status(400).send(resStatus.TYPE_EMPTY);
        if(!keyword)
            return res.status(400).send(resStatus.KEYWORD_EMPTY);

        let products;
        if(type == 'all'){
            products = await searchEngine.getProductsByAll(keyword);
        }else if(type == 'brand'){
            products = await searchEngine.getProductsByBrand(keyword);
        }else if(type == 'name'){
            products = await searchEngine.getProductsByName(keyword);
        }else if(type == 'meta'){
            products = await searchEngine.getProdutsByMeta(keyword);
        }

        return res.send(products)

    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

