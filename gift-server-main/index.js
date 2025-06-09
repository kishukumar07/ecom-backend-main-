import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectDB from './src/config/dbConfig.js';
import categoryRoute from './src/routes/categoryRoute.js';
import subCategoryRoute from './src/routes/subCategoryRoute.js';
import productRoute from './src/routes/productRoute.js';
import authRoute from './src/routes/authRoute.js';
import userRoute from './src/routes/userRoute.js';
import authenticate from './src/middlewares/authMiddleware.js';
import addressRoute from './src/routes/addressRoute.js';
import reviewRoute from './src/routes/reviewRoute.js';
import cartRoute from './src/routes/cartRoute.js';
import couponRoutes from './src/routes/couponRoutes.js';
import orderRoute from './src/routes/orderRoute.js';
import transactionRoute from './src/routes/transactionRoute.js';
import bannerRoute from './src/routes/bannerRoute.js';
import fs from 'fs';
import path from 'path';

const tempDir = path.join('public', 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

dotenv.config({
  path: './.env',
});

const app = express();

app.get('/', (req, res) => {
  res.send('Server Running!');
});

const allowedOrigins = [
  process.env.NEXT_FRONTEND_URL,
  'http://localhost:3001',
  'http://localhost:3000',
  'https://giftgin-web.vercel.app/',
  'https://gift-ginnie-website-8b8l.vercel.app',
  'https://gift-ginnie-admin.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/category', categoryRoute);
app.use('/api/subCategory', subCategoryRoute);
app.use('/api/product', productRoute);
app.use('/api/auth',authRoute);
app.use('/api/user',userRoute);
app.use('/api/address',authenticate,addressRoute);
app.use('/api/review',authenticate,reviewRoute);
app.use('/api/cart',authenticate,cartRoute);
app.use('/api/coupons', couponRoutes);
app.use('/api/order',authenticate,orderRoute);
app.use('/api/transaction',authenticate,transactionRoute);
app.use('/api/banner', bannerRoute);

app.listen(process.env.PORT || 5001, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
