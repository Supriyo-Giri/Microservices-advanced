import amqp from 'amqplib'
import logger from './logger.js'
import ENV from './env.js'

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events'

async function connectRabbitmq() {
    try {
        connection = await amqp.connect(ENV.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
        logger.info('connected to rabbit mq');
        return channel;
    } catch (error) {
        logger.error(`Error connecting to rabbit mq: ${error}`);
    }
}

export default connectRabbitmq;