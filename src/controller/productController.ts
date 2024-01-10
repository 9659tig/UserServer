import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as searchEngine from '../utils/search';
import * as productService from '../service/productService'

export const getProducts = async(req: Request, res: Response)=>{
    try{
        const clipLink: string = req.query.clipLink as string;
        if(!clipLink)
            return res.status(400).send(resStatus.CLIPLINK_EMPTY);

        const clipList = await productService.getProductsByClip(clipLink)
        return res.send(clipList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

interface Store {
    productDeepLink: string,
    productImages: string,
    productBrand: string,
    productName: string,
    productPrice: number
}
export const getStores = async(req: Request, res: Response)=>{
    try{
        const channelID: string = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        //const stores = await searchEngine.getStores(channelID);
        const stores = await productService.getProductsByInfluencer(channelID);
        const storeList:Store[] = []
        stores.forEach(product => {
            const item: Store = {
                productDeepLink: product.productDeepLink,
                productImages: product.productImages,
                productBrand: product.productBrand,
                productName: product.productName,
                productPrice: product.productPrice
            }
            storeList.push(item)
        })

        let uniqueStoreList = Array.from(new Set(storeList.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));

        return res.send(uniqueStoreList)

    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

export const getProductInfo = async(req: Request, res: Response)=>{
    try{
        const channelID: string = req.params.channelId;
        const productDeepLink: string = req.query.productDeepLink as string;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);
        if(!productDeepLink)
            return res.status(400).send(resStatus.PRODUCTDEEPLINK_EMPTY);

        const stores = await productService.getProductsByInfluencerAndDeeplink(channelID,productDeepLink);
        const clipList: string[] = [];
        stores.forEach(product => {
            clipList.push(product.clipLink)
        });

        const product = stores[0];

        delete product.videoId;
        delete product.clipLink;
        delete product.channelId;
        delete product.views;
        delete product.purchases;

        product.clipList = clipList;

        return res.send(product)

    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}

export const getProductsBySearch = async(req: Request, res: Response)=>{
    try{
        const type: string = req.params.type;
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

