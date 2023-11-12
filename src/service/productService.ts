import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";

async function getProductInfo(clipLink: string) {
    const params = {
        TableName: 'Products',
        KeyConditionExpression: "clipLink = :clipLink",
        ExpressionAttributeValues: {
        ":clipLink": { S: clipLink }
        }
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        return result.Items
    }catch(err){
        throw err
    }
}

async function getProductInfoByInfluencer(channelId: string) {
    const params = {
        TableName: 'Products',
        IndexName: 'channelId-productDeepLink-index',
        KeyConditionExpression: "channelId = :channelId",
        ExpressionAttributeValues: {
            ":channelId": { S: channelId }
        }
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        return result.Items
    }catch(err){
        throw err
    }
}

export {
    getProductInfo,
    getProductInfoByInfluencer
};