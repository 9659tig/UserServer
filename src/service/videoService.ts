import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";

async function getVideoInfo(channelID: string) {
    const params = {
        TableName: 'Videos',
        KeyConditionExpression: "channelId = :channelId",
        ExpressionAttributeValues: {
        ":channelId": { S: channelID }
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

async function getVideoListInfo() {
    const params = {
        TableName: 'Videos',
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        return result.Items
    }catch(err){
        throw err
    }
}

async function getVideoInfoByName(videoName: string) {
    const params = {
        TableName: 'Videos',
        IndexName: "videoName",
        KeyConditionExpression: "videoName = :videoName",
        ExpressionAttributeValues: {
        ":videoName": { S: videoName }
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
    getVideoInfo,
    getVideoListInfo,
    getVideoInfoByName,
};