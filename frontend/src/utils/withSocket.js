import React from "react"
import socketIOClient from "socket.io-client";

// link should be in environemnt file!
let socket = socketIOClient(process.env.REACT_APP_SOCKET_URL)

// component wrapper that allows us to use socket globaly
function withSocket (WrappedComponent) { 
  const WithSocket = props => {

    // function to subscribe to events
    const socketListen = async (queue, callback) => {
      socket.on(queue, data => {
        callback(data)
      })
    }

    const socketSend = async(queue, data) => {
      socket.emit(queue, JSON.stringify(data))
    }

    return (
      <WrappedComponent
        {...props}
        socketSend={socketSend}
        socketListen={socketListen}
      />
    )
  }
  return WithSocket
}

export default withSocket
