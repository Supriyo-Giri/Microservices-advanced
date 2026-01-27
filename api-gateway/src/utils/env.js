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
    IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL || noENV('INDENTITY_SERVICE_URL'),
    APi_GATEWAY_URL: process.env.APi_GATEWAY_URL || noENV('APi_GATEWAY_URL')
}

export default ENV