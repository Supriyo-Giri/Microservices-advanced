import 'dotenv/config'
import logger from './logger.js'

function noENV(param) {
    logger.error(`No ${param} env found`)
    process.exit(1)
}

const ENV = {
    PORT: process.env.PORT || noENV('PORT'),
    REDIS_URL: process.env.REDIS_URL || noENV('REDIS_URL'),
    NODE_ENV: process.env.NODE_ENV || noENV('NODE_ENV'),
    MONGO_URI: process.env.MONGO_URI || noENV('MONGO_URI'),
    MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || noENV('MEDIA_SERVICE_URL'),

    CLOUDINARY_CLOUD_NAME:
        process.env.CLOUDINARY_CLOUD_NAME || noENV('CLOUDINARY_CLOUD_NAME'),

    CLOUDINARY_API_KEY:
        process.env.CLOUDINARY_API_KEY || noENV('CLOUDINARY_API_KEY'),

    CLOUDINARY_API_SECRET:
        process.env.CLOUDINARY_API_SECRET || noENV('CLOUDINARY_API_SECRET'),
}

export default ENV
