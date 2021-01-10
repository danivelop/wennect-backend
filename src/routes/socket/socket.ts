/* External dependencies */
import { Server } from 'https'
import { Server as SocketServer, Socket } from 'socket.io'

/* Internal dependencies */
import SocketEvent from 'constants/SocketEvent'

class SocketIO {
  _io: SocketServer | null

  constructor() {
    this._io = null
  }

  get io(): SocketServer {
    return this._io as SocketServer
  }

  init(server: Server) {
    this._io = new SocketServer(server, {
      cors: {
        origin: '*',
      },
    })
    this.connect()
  }

  connect() {
    this.io.on('connection', (socket: Socket) => {
      this.enter(socket)
      this.leave(socket)
      this.iceCandidate(socket)
      this.offer(socket)
      this.answer(socket)
    })
  }

  enter(socket: Socket) {
    socket.on(SocketEvent.Enter, (roomId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      socket.join(roomId)
      socket.to(roomId).emit(SocketEvent.Enter, socket.id)
    })
  }

  leave(socket: Socket) {
    socket.on(SocketEvent.Leave, (roomId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      socket.leave(roomId)
      socket.to(roomId).emit(SocketEvent.Leave, socket.id)
    })
  }

  iceCandidate(socket: Socket) {
    socket.on(SocketEvent.IceCandidate, (remoteId: string, iceCandidate) => {
      this.io
        .to(remoteId)
        .emit(SocketEvent.IceCandidate, socket.id, iceCandidate)
    })
  }

  offer(socket: Socket) {
    socket.on(SocketEvent.Offer, (remoteId: string, sessionDescription) => {
      this.io
        .to(remoteId)
        .emit(SocketEvent.Offer, socket.id, sessionDescription)
    })
  }

  answer(socket: Socket) {
    socket.on(SocketEvent.Answer, (remoteId: string, sessionDescription) => {
      this.io
        .to(remoteId)
        .emit(SocketEvent.Answer, socket.id, sessionDescription)
    })
  }
}

export default new SocketIO()
