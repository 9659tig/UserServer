const docClient = require('../config/dynamo')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");

async function getInfluencer(channelID) {
    const params = {
        TableName: 'Influencers',
        KeyConditionExpression: "channelId = :channelId",
        ExpressionAttributeValues: {
        ":channelId": { S:  channelID}
        }
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        return result.Items[0]
        if (result.Items.length > 0) return true
        else return false
    }catch(err){
        throw err
    }
}

module.exports = {
    getInfluencer,
};
