import express from 'express'
import cors from 'cors'
import Redis from 'ioredis'
import ENV from './utils/env.js'
import logger from './utils/logger.js'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import proxy from 'express-http-proxy'
import errorHandler from './middlewares/errroHandler.js'
import { validateToken } from './middlewares/auth.js'
 
const app = express();
const PORT = ENV.PORT;

const redisClient = new Redis(ENV.REDIS_URL);

app.use(helmet())
app.use(cors())
app.use(express.json())

//rate limiting

const rateLimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000, //How long to remember requests for, in milliseconds
    max: 100,
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

app.use(rateLimitOptions);

app.use((req,res,next) => {
    logger.info(`${req.method} ${req.url} ip: ${req.ip}`);
    logger.info(`Request body: ${req.body}`);
    next();
})

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler: (err,res,next) =>{
        logger.error(`Proxy Error: ${err.message}`);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message
        })
    }
}

//setting up proxy for our identity service
app.use('/v1/auth',proxy(ENV.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Identity service: ${proxyRes.statusCode}`)
        return proxyResData
    }
}));

//setting up proxy for our post service
app.use('/v1/posts',validateToken, proxy(ENV.POST_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId

        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Identity service: ${proxyRes.statusCode}`)
        return proxyResData
    }
}))

app.use(errorHandler);

app.listen(PORT,()=>{
    logger.info(`API gateway is running on: ${ENV.API_GATEWAY_URL}`);
    logger.info(`Identity-service is running on: ${ENV.IDENTITY_SERVICE_URL}`);
    logger.info(`Post-service is running on: ${ENV.POST_SERVICE_URL}`);
    logger.info(`Redis url: ${ENV.REDIS_URL}`);
})