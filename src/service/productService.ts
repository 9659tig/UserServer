import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

async function getProductsByClip(clipLink: string) {
    const params = {
        TableName: 'Products',
        KeyConditionExpression: "clipLink = :clipLink",
        ExpressionAttributeValues: marshall({
            ":clipLink": clipLink
        })
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)

        if (result.Items){
            return result.Items.map(item => unmarshall(item))
        } else {
            return []
        }
    }catch(err){
        throw err
    }
}

async function getProductsByInfluencer(channelId: string) {
    const params = {
        TableName: 'Products',
        IndexName: 'channelId-productDeepLink-index',
        KeyConditionExpression: "channelId = :channelId",
        ExpressionAttributeValues: marshall({
            ":channelId": channelId
        })
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)

        if (result.Items){
            return result.Items.map(item => unmarshall(item))
        } else {
            return []
        }
    }catch(err){
        throw err
    }
}

async function getProductsByInfluencerAndDeeplink(channelId: string, productDeepLink: string) {
    const params = {
        TableName: 'Products',
        IndexName: 'channelId-productDeepLink-index',
        KeyConditionExpression: "channelId = :channelId and productDeepLink = :productDeepLink",
        ExpressionAttributeValues: marshall({
            ":channelId": channelId,
            ":productDeepLink": encodeURI(productDeepLink)
        })
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)

        if (result.Items){
            return result.Items.map(item => unmarshall(item))
        } else {
            return []
        }
    }catch(err){
        throw err
    }
}

export {
    getProductsByClip,
    getProductsByInfluencer,
    getProductsByInfluencerAndDeeplink
};