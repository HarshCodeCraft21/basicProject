const app = require('./app');
const connectDB = require('./config/db');


require('dotenv').config();

const PORT = process.env.PORT || 3000;


const startServer = async () => {
  
  await connectDB();

  
  app.listen(PORT, () => {
    console.log(`\n\x1b[35m==================================================\x1b[0m`);
    console.log(`\x1b[1m\x1b[36m[Harsh Server]: Running in ${process.env.NODE_ENV || 'development'} mode\x1b[0m`);
    console.log(`\x1b[1m\x1b[32m[Harsh Server]: Listening on: http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[35m==================================================\n\x1b[0m`);
  });
};

startServer();
