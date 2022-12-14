import { createServer } from 'http';
import { Server } from 'socket.io';

export interface IMessage {
  userSend?: string;
  userRequest?: string;
  timeMessageSend?: string;
  messages: Array<string>;
}

const dbMessage: Array<IMessage> = [];

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  //   socket.on('chat', (data) => {
  //     console.info('Menssagem recebida: ', data);
  //   });

  socket.on('chat', (data) => {
    console.info('connection::enviando: ', data);

    const message: IMessage = {
      userSend: socket.id,
      timeMessageSend: new Date().toString(),
      messages: data.messages,
    };

    dbMessage.push(message);
    socket.broadcast.emit('getMessages', dbMessage);
  });

  socket.on('getMessages', (data) => {
    socket.emit('getMessages', dbMessage);
  });
  
});

console.info('Iniciando teste');

httpServer.listen(3005);
