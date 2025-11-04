import { io } from "socket.io-client"

export const socket = io('http://localhost:8001' , {
    path : '/sockets',
    transports : ['websocket']
}) // and thats how we create a socket for now