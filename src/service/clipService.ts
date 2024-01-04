import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

async function getClipInfo(videoID: string) {
    const params = {
        TableName: 'Clips',
        KeyConditionExpression: "videoId = :videoId",
        ExpressionAttributeValues: marshall({
        ":videoId": videoID
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
    getClipInfo
};