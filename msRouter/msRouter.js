const express = require("express")
const socketIO = require('socket.io');
const http = require('http')
var rabbit = require('amqplib/callback_api');

const pino = require('pino');
require('dotenv').config();

const LOGGER = pino({ level: process.env.LOG_LEVEL || 'info' });

LOGGER.info("Starting server")
let server = http.createServer(express()) 
let io = socketIO(server) 

// allow all cors stuff
io.origins('*:*')


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
        channel.consume("frontendMessage", (event) => {
            console.log(JSON.parse(event.content.toString()))
            // onUserLogin(JSON.parse(event.content.toString()))
        }, {
            noAck: true
        })

        LOGGER.info("All consumers ready")
    })
});


io.on('connection', (socket)=>{
    LOGGER.debug(`New user connected ${socket.id}`)

    socket.on("message", (data) => {
        event.socketId = socket.id
        event.data = JSON.parse(data)
        LOGGER.debug(event)
        rabbit.channel.send("userLogin", event)
    })
});

server.listen(process.env.INTERNAL_API_PORT)
