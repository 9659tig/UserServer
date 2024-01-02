import axios from 'axios';
import { OS_ACCESS } from '../config/secret';
import { searchData } from './searchData';

const createProduct = (productInfo: any) => {
    return {
        productDeepLink: productInfo.productDeepLink,
        channelId: productInfo.channelId,
        productImage: productInfo.productImages,
        productBrand: productInfo.productBrand,
        productPrice: productInfo.productPrice,
        productName: productInfo.productName,
        clipLinks: [productInfo.clipLink],
        purchaseCnt: productInfo.purchases,
        views: productInfo.views
    };
}

async function getStores(channelID: string) {
    const stores = await searchData('products', 'channelId', channelID);

    const productsLength = stores.length
    const storeList = []
    if (productsLength == 0)
        return stores

    let product = createProduct(stores[0]);

    for(let i=1; i<productsLength; i++){
        if (product.productDeepLink == stores[i].productDeepLink){
            product.clipLinks.push(stores[i].clipLink)
        }else{
            storeList.push(product)
            product = createProduct(stores[i]);
        }
    }
    storeList.push(product)

    return storeList;
}

async function getInfluencersByChanneid(channelName: string) {
    const influencers = await searchData('influencers', 'channelId', channelName);
    return influencers;
}

async function getInfluencersByChannelname(channelName: string) {
    const influencers = await searchData('influencers', 'channelName', channelName);
    return influencers;
}

async function getProductsByAll(keyword: string) {
    const products = await axios.get('https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/products/_search', {
        params: {
            source: JSON.stringify({
                query: {
                    multi_match: {
                        query: keyword,
                        fields: ["productName", "productBrand"]
                    }
                }
            }),
            source_content_type: 'application/json'
        },
        auth: {
            username: OS_ACCESS.USER,
            password: OS_ACCESS.PASSWORD
        }
    });

    const productList = products.data.hits.hits.map((hit: { _source: any; }) => hit._source);
    if (!productList)
        throw new Error;

    return productList;
}

async function getProductsByBrand(keyword: string) {
    const productList = await searchData('products', 'productBrand', keyword);
    return productList;
}

async function getProductsByName(keyword: string) {
    const productList = await searchData('products', 'productName', keyword);
    return productList;
}

async function getProdutsByMeta(keyword: string) {
    const productList = await searchData('products', 'metaInfo', keyword);
    return productList;
}

async function getProdutsByCliplink(keyword: string) {
    const productList = await searchData('products', 'clipLink', keyword);
    return productList;
}

export {
    getStores,
    getInfluencersByChannelname,
    getInfluencersByChanneid,
    getProductsByAll,
    getProductsByBrand,
    getProductsByName,
    getProdutsByMeta,
    getProdutsByCliplink
};