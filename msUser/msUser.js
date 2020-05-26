var rabbit = require('amqplib/callback_api');
const pino = require('pino');
require('dotenv').config();

const LOGGER = pino({ level: process.env.LOG_LEVEL || 'info' });

const queues = ["userLogin", "frontendMessages"]


LOGGER.info(`Connecting to RabbitMQ`)
rabbit.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
        throw error0;
    }
    LOGGER.info("Creating default channel on default exchange")
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        rabbit.channel = channel

        LOGGER.info("Creating queues on channel")
        queues.forEach(queue => {
            channel.assertQueue(queue, {
                durable: false
            })
            LOGGER.info(`Created ${queue} on channel`)
        })
        
        channel.send = (queue, message) => {
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
        }

        LOGGER.info("Attaching consumers...")
        channel.consume("userLogin", (event) => {
            onUserLogin(JSON.parse(event.content.toString()))
        }, {
            noAck: true
        })

        LOGGER.info("All consumers ready")
    })
});


async function onUserLogin(event) {
    LOGGER.debug(event)

    // TODO save user to database & anything else you might want to do

    LOGGER.debug(`Sending login response`)
    let response = {
        type: "loginResponse",
        res: "User logged in",
        socketId: event.socketId
    }
    rabbit.channel.send("frontendMessage", response)
}