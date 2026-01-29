import cloudinary from 'cloudinary'
import logger from './logger.js'
import ENV from './env.js'

cloudinary.v2

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
})

const uploadMediaToCloudinary = (file) =>{
    return new Promise ((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'auto'
        },(error, result)=> {
            if(error){
                logger.error('Error while uploading media to cloudinary', error);
                reject(error)
            }else{
                resolve(result)
            }
        })
        uploadStream.end(file.buffer);
    })
}

export default uploadMediaToCloudinary;
