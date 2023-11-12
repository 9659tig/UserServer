import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";

async function getInfluencerInfo(channelID: string) {
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
        if (result.Items)
            return result.Items[0]
    }catch(err){
        throw err
    }
}

export {
    getInfluencerInfo
};
