const docClient = require('../config/dynamo')
const {QueryCommand} = require("@aws-sdk/client-dynamodb");

async function getProductInfo(clipLink) {
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

async function getProductInfoByInfluencer(channelId) {
    const params = {
        TableName: 'Products',
        IndexName: 'channelId-index',
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

module.exports = {
    getProductInfo,
    getProductInfoByInfluencer
};