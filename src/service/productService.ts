import docClient from '../config/dynamo';
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

async function getProductInfo(clipLink: string) {
    const params = {
        TableName: 'Products',
        KeyConditionExpression: "clipLink = :clipLink",
        ExpressionAttributeValues: marshall({
        ":clipLink": clipLink
        })
    };

    try{
        const command = new QueryCommand(params)
        const result = await docClient.send(command)
        if (result.Items){
            return result.Items.map(item => unmarshall(item))
        } else {
            return []
        }    }catch(err){
        throw err
    }
}

export {
    getProductInfo,
};