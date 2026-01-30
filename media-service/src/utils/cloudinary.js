import cloudinary from 'cloudinary'
import logger from './logger.js'
import ENV from './env.js'

cloudinary.v2.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: ENV.CLOUDINARY_API_KEY.trim(),
    api_secret: ENV.CLOUDINARY_API_SECRET.trim(),
})

export const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    logger.error('Error while uploading media to cloudinary', error)
                    reject(error)
                } else {
                    resolve(result)
                }
            }
        )

        uploadStream.end(file.buffer)
    })
}

export const delteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info('Media deleted successfully from cloud storage',publicId);
        return result;
    } catch (error) {
        logger.error('Error deleting media from cloudinary', error);
        throw error
    }
}
