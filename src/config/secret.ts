import dotenv from 'dotenv'
dotenv.config()

const DYNAMO_ACCESS = {
    KEY : process.env.DYNAMO_ACCESS_KEY,
    SECRET_KEY : process.env.DYNAMO_SECRET_KEY
}

const OS_ACCESS = {
    USER : process.env.OS_USER as string,
    PASSWORD : process.env.OS_PASSWORD as string
}

export {
    DYNAMO_ACCESS,
    OS_ACCESS
}