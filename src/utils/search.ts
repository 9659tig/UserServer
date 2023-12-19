import axios from 'axios';
import { OS_ACCESS } from '../config/secret';

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
    const stores = await axios.get('https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/products/_search', {
        params: {
            source: JSON.stringify({
                query: {
                    match: {
                        channelId: channelID
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

    const productList = stores.data.hits.hits.map((hit: { _source: any; }) => hit._source);
    if (!productList)
        throw new Error;

    const productsLength = productList.length
    const storeList = []
    if (productsLength == 0)
        return productList

    let product = createProduct(productList[0]);

    for(let i=1; i<productsLength; i++){
        if (product.productDeepLink == productList[i].productDeepLink){
            product.clipLinks.push(productList[i].clipLink)
        }else{
            storeList.push(product)
            product = createProduct(productList[i]);
        }
    }
    storeList.push(product)

    return storeList;
}

async function getInfluencers(channelName: string) {
    const response = await axios.get('https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/influencers/_search', {
        params: {
            source: JSON.stringify({
                query: {
                    match: {
                        channelName: channelName
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

    const influencers = response.data.hits.hits.map((hit: { _source: any; }) => hit._source);
        if (!influencers)
            throw new Error;

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
    const products = await axios.get('https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/products/_search', {
        params: {
            source: JSON.stringify({
                query: {
                    match: {
                        productBrand: keyword
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

async function getProductsByName(keyword: string) {
    const products = await axios.get('https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/products/_search', {
        params: {
            source: JSON.stringify({
                query: {
                    match: {
                        productName: keyword
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



export {
    getStores,
    getInfluencers,
    getProductsByAll,
    getProductsByBrand,
    getProductsByName
};