const docClient = require('../config/dynamo')
const {QueryCommand} = require("@aws-sdk/client-dynamodb");

async function getClipInfo(videoID) {
    const params = {
        TableName: 'Clips',
        KeyConditionExpression: "videoId = :videoId",
        ExpressionAttributeValues: {
        ":videoId": { S: videoID }
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
    getClipInfo
};