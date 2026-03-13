import dotenv from 'dotenv'
dotenv.config()

const DYNAMO_ACCESS = {
    KEY : process.env.DYNAMO_ACCESS_KEY,
    SECRET_KEY : process.env.DYNAMO_SECRET_KEY
}

const SEARCH_CONFIG = {
    EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'gemini',
    SEARCH_ALPHA: parseFloat(process.env.SEARCH_ALPHA || '0.4'),
    SEARCH_BETA: parseFloat(process.env.SEARCH_BETA || '0.6'),
    INTERNAL_SYNC_TOKEN: process.env.INTERNAL_SYNC_TOKEN || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    EMBEDDING_BATCH_SIZE: parseInt(process.env.EMBEDDING_BATCH_SIZE || '100', 10),
}

export {
    DYNAMO_ACCESS,
    SEARCH_CONFIG
}