import logger from "../utils/logger.js";
import uploadMediaToCloudinary from "../utils/cloudinary.js";
import Media from "../models/Media.js";

export const uploadMediaController = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file Found! please add a file and try again!");
      return res.status(400).json({
        success: false,
        message: "No file found",
      });
    }

    const { originalName, mimeType, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: name=${originalName}, type=${mimeType}`);
    logger.info("Upload to cloudinary starting...");

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Upload to Cloudinary was successful. Public Id: ${cloudinaryUploadResult.public_id}`,
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName,
      mimeType,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      message: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload is successfull",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};
