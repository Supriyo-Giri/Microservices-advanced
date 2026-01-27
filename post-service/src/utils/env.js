import 'dotenv/config'
import logger from './logger.js'

function noENV(param) {
    logger.error(`No ${param} env found`)
    process.exit(1);
}

const ENV = {
    PORT: process.env.PORT || noENV('PORT'),
    REDIS_URL: process.env.REDIS_URL || noENV('REDIS_URL'),
    NODE_ENV: process.env.NODE_ENV || noENV('NODE_ENV'),
    MONGO_URI: process.env.MONGO_URI || noENV('MONGO_URI'),
    POST_SERVICE_URL: process.env.POST_SERVICE_URL || noENV('POST_SERVICE_URL')
}

export default ENV