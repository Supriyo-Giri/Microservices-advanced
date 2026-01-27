import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import Redis from 'ioredis'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'

import postRoutes from './routes/post.route.js'
import errorHandler from './middlewares/errroHandler.js'
import logger from './utils/logger.js'
import { connectDb } from './utils/db.js'
import ENV from './utils/env.js'

const app = express();
const PORT = ENV.PORT;
const redisClient = new Redis(ENV.REDIS_URL)


//middlewares
app.use(express.json());
app.use(helmet());
app.use(cors())


// ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //How long to remember requests for, in milliseconds
    max: 50,
    standardHeaders: true, //Enable the Ratelimit header
    legacyHeaders: false, //	Enable the X-Rate-Limit header
    handler: (req,res) => {
        logger.warn(`Sensitive endopint rate limit exceded for IP: ${req.ip}`)
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }) //Name associated with the quota policy enforced by this rate limiter.
})
app.use('/api/posts',sensitiveEndpointsLimiter)


//routes
app.use('/api/posts',(req,res,next)=>{
    req.redisClient = redisClient;
    next()
},postRoutes)
app.use(errorHandler);

app.listen(PORT,()=>{
    connectDb();
    logger.info(`Post-service started on : ${ENV.POST_SERVICE_URL}`);
})

//unhandled promise rejection
process.on('unhandledRejection',(reason, promise)=>{
    logger.error(`unhandledRejection at: ${promise} reason: ${reason}`);
})