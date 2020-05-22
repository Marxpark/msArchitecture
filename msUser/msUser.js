var rabbit = require('amqplib/callback_api');
const pino = require('pino');

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

        channel.assertQueue("userLogin", {
            durable: false
        })

        channel.assertQueue("frontendMessage", {
            durable: false
        })

        // LOGGER.info("Creating queues on channel")
        // queues.forEach(queue => {
        //     channel.assertQueue(queue, {
        //         durable: false
        //     })
        //     LOGGER.info(`Created ${queue} on channel`)
        // })
        
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
    LOGGER.debug(`Sending login response`)
    rabbit.channel.send("frontendMessages", "Thank you for loging in!")
}