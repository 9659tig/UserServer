import dotenv from 'dotenv'
dotenv.config()

const DYNAMO_ACCESS = {
    KEY : process.env.DYNAMO_ACCESS_KEY,
    SECRET_KEY : process.env.DYNAMO_SECRET_KEY
}

export {
    DYNAMO_ACCESS,
}