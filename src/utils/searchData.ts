import axios from 'axios';
import { OS_ACCESS } from '../config/secret';

async function searchData(category: string, matchKey: string, matchVal: string){
    const response = await axios.get(`https://search-linpl-v6bmftpwgytkxfbypg3q7sxgr4.ap-northeast-2.es.amazonaws.com/${category}/_search`, {
        params: {
            source: JSON.stringify({
                query: {
                    match: {
                        [matchKey]: matchVal
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

    const dataList = response.data.hits.hits.map((hit: { _source: any; }) => hit._source);
    if (!dataList)
        throw new Error;

    return dataList;
}

export {
    searchData
};
