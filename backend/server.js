const app = require('./app');
const connectDB = require('./config/db');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected Successfully");

    app.listen(PORT, () => {
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