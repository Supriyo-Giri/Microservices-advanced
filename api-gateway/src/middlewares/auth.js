import logger from '../utils/logger.js'
import jwt from 'jsonwebtoken'
import ENV from '../utils/env.js'

export const validateToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        logger.warn('Access attempt without valid token!');
        return res.status(401).json({
            message: 'Authentication required',
            success: false
        })
    }

    jwt.verify(token, ENV.JWT_SECRET,(err,user)=> {
        if(err){
        logger.warn('Invalid token');
        return res.status(429).json({
            message: 'Invalid token',
            success: false
        });
    }
    req.user = user;
    next();
    })
}