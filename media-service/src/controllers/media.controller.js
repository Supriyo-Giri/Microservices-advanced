import logger from "../utils/logger.js"
import { uploadMediaToCloudinary } from "../utils/cloudinary.js"
import Media from "../models/Media.js"

export const uploadMediaController = async (req, res) => {
    logger.info("Starting media upload")

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file found",
            })
        }

        const {
            originalname: originalName,
            mimetype: mimeType,
            buffer,
        } = req.file

        const userId = req.user.userId

        logger.info(`File details: name=${originalName}, type=${mimeType}`)
        logger.info("Upload to Cloudinary starting...")

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)

        logger.info(
            `Upload to Cloudinary successful. Public Id: ${cloudinaryUploadResult.public_id}`
        )

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName,
            mimeType,
            url: cloudinaryUploadResult.secure_url,
            userId,
        })

        await newlyCreatedMedia.save()

        res.status(201).json({
            success: true,
            id: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: "Media upload successful",
        })
    } catch (error) {
        logger.error("Error creating Media", error)
        res.status(500).json({
            success: false,
            message: "Error creating Media",
            error: error.message,
        })
    }
}

export const getAllMediaController = async (req,res) => {
    try {
        const results = await Media.find({})
        res.json({
            results
        })
    } catch (error) {
        logger.error("Error fetching all Medias", error)
        res.status(500).json({
            success: false,
            message: "Error fetching all Medias",
            error: error.message,
        })
    }
}
