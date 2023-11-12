import { Request, Response } from 'express';
import resStatus from '../config/response'
import * as productService from '../service/productService'

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

const createProduct = (productInfo: any) => {
    return {
        productDeepLink: productInfo.productDeepLink,
        channelId: productInfo.channelId,
        productImage: productInfo.productImages,
        productBrand: productInfo.productBrand,
        productPrice: productInfo.productPrice.N,
        productName: productInfo.productName,
        clipLinks: [productInfo.clipLink]
    };
}
export const getProductsByInfluencer = async(req: Request, res: Response)=>{
    try{
        const channelID = req.params.channelId;
        if(!channelID)
            return res.status(400).send(resStatus.CHANNELID_EMPTY);

        const productList = await productService.getProductInfoByInfluencer(channelID)
        if (!productList)
            throw new Error;

        const productsLength = productList.length
        const storeList = []
        if (productsLength == 0)
            return res.send(productList)

        let product = createProduct(productList[0]);

        for(let i=1; i<productsLength; i++){
            if (product.productDeepLink.S == productList[i].productDeepLink.S){
                product.clipLinks.push(productList[i].clipLink)
            }else{
                storeList.push(product)
                product = createProduct(productList[i]);
            }
        }
        storeList.push(product)
        return res.send(storeList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}