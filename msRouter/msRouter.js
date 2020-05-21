const express = require("express")
const socketIO = require('socket.io');
const http = require('http')

const pino = require('pino');
require('dotenv').config();

const LOGGER = pino({ level: process.env.LOG_LEVEL || 'info' });

LOGGER.info("Starting server")
let server = http.createServer(express()) 
let io = socketIO(server) 

// allow all cors stuff
io.origins('*:*')

io.on('connection', (socket)=>{
    LOGGER.debug(`New user connected ${socket.id}`)

    socket.on("message", (data) => {
        let event = JSON.parse(data)
        LOGGER.debug(event)
    })
});

server.listen(process.env.INTERNAL_API_PORT)