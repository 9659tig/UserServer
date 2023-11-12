import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";

async function getClipInfo(videoID: string) {
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

export {
    getClipInfo
};