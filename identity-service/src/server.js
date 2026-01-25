import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'ioredis';
import ENV from './utils/env.js';
import { connectDb } from './utils/db.js'
import logger from './utils/logger.js'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import authRoutes from './routes/user.route.js'
import errorHandler from './middlewares/errorHandler.js'


const app = express();

const PORT = ENV.PORT;
const redisClient = new Redis(process.env.REDIS_URL)


//middlewares
app.use(express.json());
app.use(helmet());
app.use(cors())
app.use((req,res,next) => {
    logger.info(`${req.method} ${req.url} ip: ${req.ip}`);
    next();
})

//DDoS protection and rate limiting middleware
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient, //stores rate limit data
    keyPrefix: 'middleware', // makes it unique, from other redis data
    points: 10, //maximum number of request an ip can make in an given period of time
    duration: 3, //we can make 10 req in 1 sec
})
app.use((req,res,next) => {
    rateLimiter.consume(req.ip).then(()=> next()).catch(()=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        })
    })
})

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
app.use('/api/auth/register',sensitiveEndpointsLimiter)


//routes

app.use('/api/auth', authRoutes);

//error handler
app.use(errorHandler)

app.listen(PORT, ()=>{
    connectDb();
    logger.info(`Server started on port: ${PORT}`);
})

//unhandled promise rejection
process.on('unhandledRejection',(reason, promise)=>{
    logger.error(`unhandledRejection at: ${promise} reason: ${reason}`);
})