import express from 'express'
import multer from 'multer'

import { uploadMediaController } from '../controllers/media.controller.js'
import { authenticateRequest } from '../middlewares/auth.js'

import logger from '../utils/logger.js'

const router = express.Router();

//congiguring multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 *1024
    }
}).single('file')

router.post('/upload', authenticateRequest, (req,res,next)=>{
    upload(req,res,function (error) {
        if(error instanceof multer.MulterError){
            logger.error('Multer error while uploading: ',error)
            return res.status(400).json({
                message: 'Multer error while uploading',
                error: error.message,
                stack: error.stack
            })
        }else if(error){
            logger.error('Unknown error occured while uploading',error)
            return res.status(400).json({
                message: 'Unknown error occured while uploading',
                error: error.message,
                stack: error.stack
            })
        }
        if(!req.file){
            return req.status(400).json({
                message: 'No file found',
            })
        }
    next()
    })
}, uploadMediaController)

export default router;
