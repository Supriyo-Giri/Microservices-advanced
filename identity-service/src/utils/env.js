import 'dotenv/config'
import logger from './logger.js'

function noENV(param) {
    logger.error(`No ${param} env found`)
    process.exit(1);
}

const ENV = {
    PORT: process.env.PORT || noENV('PORT'),
    MONGO_URI: process.env.MONGO_URI || noENV('MONGO_URI'),
    JWT_SECRET: process.env.JWT_SECRET || noENV('JWT_SECRET'),
    REDIS_URL: process.env.REDIS_URL || noENV('REDIS_URL'),
}

export default ENV