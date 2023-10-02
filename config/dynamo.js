const {DYNAMO_ACCESS} = require('./secret')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");


const docClient = new DynamoDBClient({
    region: 'ap-northeast-2',
    credentials:{
        accessKeyId: DYNAMO_ACCESS.KEY,
        secretAccessKey: DYNAMO_ACCESS.SECRET_KEY,
    }
});

module.exports = docClient;