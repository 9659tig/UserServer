const docClient = require('../config/dynamo')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");

async function getVideoInfo(channelID) {
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

async function getVideoInfoByName(videoName) {
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

module.exports = {
    getVideoInfo,getVideoListInfo,getVideoInfoByName,
};