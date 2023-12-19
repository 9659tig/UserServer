import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as productService from '../service/productService'
import { getStores, getProductsByAll, getProductsByName, getProductsByBrand } from '../utils/search';


export const getProducts = async(req: Request, res: Response)=>{
    try{
        const clipLink: string = req.query.clipLink as string;
        console.log(clipLink)
        if(!clipLink)
            return res.status(400).send(resStatus.CLIPLINK_EMPTY);

        const clipList = await productService.getProductInfo(clipLink)
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

        const stores = await getStores(channelID);

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
            products = await getProductsByAll(keyword);
        }else if(type == 'brand'){
            products = await getProductsByBrand(keyword);
        }else if(type == 'name'){
            products = await getProductsByName(keyword);
        }

        return res.send(products)

    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

