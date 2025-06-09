import type { Socket } from "socket.io";
// import App from "../app";


export class SocketService {

    connect(socket: Socket) {
    
        // App._io.sockets.allSockets().then(all => 
        //     // socketLogger.info(`User connected to socket! id:${socket.id}, current total connections: ${all.size}`);
        // })
        this.listenRoomJoin(socket)
        // this.listenErrors(socket)
    }


    private listenRoomJoin(socket:Socket){
        socket.on('joinRoom', (data) => {
            socket.data = data;
            socket.join(data.rooms)
            // socketLogger.info(`User join to socket rooms! id:${data.id}, room: ${data.rooms.join("|")}`);
        })
        socket.on('leaveRoom', (data) => {
            socket.data = data;
            socket.leave(data.rooms)
            // socketLogger.info(`User join to socket rooms! id:${data.id}, room: ${data.rooms.join("|")}`);
        })
        socket.on('sendToRoom',(data)=>{
            App._io.to(data.rooms).emit(data.event, data.data);
        })
    }

    private listenErrors(socket:Socket){
        // socket.on('disconnect', () => {
        //     app._io.sockets.allSockets().then(all => {
        //         all.size;
        //     //   socketLogger.info(`User disconnected from socket! id:${socket.id}, current total connections: ${all.size}`);
        //     })
        //     // console.log('user disconnected', socket.id);
        //   });
      
          socket.on('connect_failed', () => {
            // socketLogger.error(`Socket connect failed! id:${socket.id}`);
            // console.log('connect_failed');
          });
      
          socket.on('error', err => {
            // socketLogger.error(`Socket error! id:${socket.id}`, err);
            // console.log('error', err);
          });
    }
}