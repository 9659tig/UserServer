import docClient from '../config/dynamo'
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

async function getInfluencerInfo(channelID: string) {
    const params = {
        TableName: 'Influencers',
        KeyConditionExpression: "channelId = :channelId",
        ExpressionAttributeValues: marshall({
        ":channelId": channelID
        })
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        if (result.Items){
            return unmarshall(result.Items[0]);
        } else {
            return []
        }
    }catch(err){
        throw err
    }
}

export {
    getInfluencerInfo,
};