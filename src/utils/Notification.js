import socketIo from 'socket.io';
import { verifyAdminSocket } from '../middlewares/authMiddleware';
export default class Notification {
  constructor(app) {
    this.io = socketIo(app);
    this.socket = null;
    this.username = null;
  }
  start() {
    console.log('Notification class started');
    this.io.use(verifyAdminSocket).on('connection', (socket) => {
      console.log(`${socket.decoded.username} connected to cybersource socket successfully`);
      this.username = socket.decoded.username;
      this.socket = socket;
    });
    this.io.on('disconnect', () => {
      console.log('user disconnected');
    });
  }
  trigger(id, message) {
    if (!this.socket || !this.username) {
      console.log('Socket not connected. Please start socket connection');
    }
    else { 
      this.socket.emit(`${this.username}-${id}`, message);
    }
  }
}
