import logger from '../utils/logger.js';
import validateRegistration from '../utils/validation.js';
import { User } from '../models/User.js'
import { generateTokens } from '../utils/generateToken.js'

//health check controller
export const healthCheckController = (req,res) => {
    logger.info(`Health check end point was hit`);
    try {
        res.status(200).json({
        success: true,
        message: 'Service is up and running...'
    })
    logger.info(`Service is up and running...`);
    } catch (error) {
        logger.error('Error occured',error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

//get all users
export const getAllUsersController = async (req,res) => {
    logger.info(`All users endpoint was hit`);
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users
        })
        logger.warn(`All users were successfully fetched`);
    } catch (error) {
        logger.error(`Error in get all users controller: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

//user registration 
export const registerUserController = async (req,res) => {
    logger.info(`Registration end point was hit`);
    try {
        //schema validation
        const { error } = validateRegistration(req.body);
        if(error){
            logger.warn(`Validation error: ${error.message}`);
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        const { email, password, username }= req.body;

        let user = await User.findOne({ $or: [{email},{username}] });
        if(user){
            logger.warn(`User already exists`);
            return res.status(400).json({
                success: false,
                message: 'user with this email or password already exists',
            })
        }

        user = new User({ username, email, password});

        await user.save();
        logger.warn(`User created successfully [id: ${user._id}]`);

        const { accessToken, refreshToken } = await generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'User registered Successfully',
            accessToken,
            refreshToken
        })

    } catch (error) {
        logger.error(`Registration error occured: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

//user login

// refresh token

//logout