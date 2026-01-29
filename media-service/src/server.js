import cors from 'cors'
import helmet from 'helmet'
import express from 'express'

import ENV from './utils/env.js'
import logger from './utils/logger.js'
import mediaRoutes from './routes/media.route.js'
import errorHandler from './middlewares/errroHandler.js'
import { connectDb } from './utils/db.js'

const app = express();
const PORT = ENV.PORT;


//middlewares
app.use(express.json());
app.use(helmet());
app.use(cors())


app.use('/api/media', mediaRoutes);
app.use(errorHandler);


app.listen(PORT,()=>{
    connectDb();
    logger.info(`Service started on : ${ENV.MEDIA_SERVICE_URL}`);
})

//unhandled promise rejection
process.on('unhandledRejection',(reason, promise)=>{
    logger.error(`unhandledRejection at: ${promise} reason: ${reason}`);
})