const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');


require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();


app.use(
  helmet({
    crossOriginResourcePolicy: false, 
  })
);


if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}


app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'https://basicproject-frontend.onrender.com',
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Soft Sandy E-Commerce REST API! Server is fully operational.',
    version: '1.0.0',
  });
});

app.get("/", (req, res) => {
  res.send("Backend API Running Successfully 🚀");
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;
