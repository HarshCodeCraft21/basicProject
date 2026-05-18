const http = require('http');
const socketio = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://basicproject-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io Server]: Client connected with socket ID: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io Server]: Client disconnected: ${socket.id}`);
  });
});

app.set('socketio', io);

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected Successfully");

    server.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`[Harsh Server]: Running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Harsh Server]: Listening on PORT ${PORT}`);
      console.log(`==================================================\n`);
    });

  } catch (error) {
    console.log("Server Startup Error:", error.message);
  }
};

startServer();