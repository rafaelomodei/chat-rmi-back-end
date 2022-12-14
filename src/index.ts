import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('chat', (data) => {
    console.info('Menssagem recebida: ', data);
  });

  socket.on('messageServer', (data) => {
    console.info('connection::enviando: ', data);
    socket.emit('message', { message: data });
  });
});

console.info('Iniciando teste');

httpServer.listen(3005);
