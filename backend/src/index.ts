import dotenv from 'dotenv';
// Load environment variables FIRST, before any other imports
dotenv.config();
import cors from 'cors';

import express, { Request, Response } from 'express';
import path from 'path';
import passport from './auth/passport';  // passport configuration
import { json } from 'body-parser';
import authRoute from './routes/authRoute';  // our authRoute
import userRoute from './routes/userRoute';  // our userRoute
import classroomRoute from './routes/classroomRoute';
// import aiWorkerRoute from './routes/aiWorkerRoute';
import connectDB from './database/db';

const app = express();

const allowedOrigins = [process.env.FE_BASE_URL, 'http://localhost:3001'].filter(
  (origin): origin is string => Boolean(origin)
);

// CORS middleware
// app.use((req: Request, res: Response, next) => {
//   const allowedOrigins = [process.env.FE_BASE_URL, 'http://localhost:3001'];
//   const origin = req.headers.origin;

//   if (origin && allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');

//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });
app.use(cors({
  origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
// middleware to parse json bodies
app.use(json());

// authRoute
app.use('/api/auth', authRoute);

// userRoute
app.use('/api/user', userRoute);

// classroomRoute
app.use('/api/classroom', classroomRoute);

// // aiWorkerRoute
// app.use('/api/ai-worker', aiWorkerRoute);

// simple frontend page to test auth + protected endpoints
app.get('/test', (req: Request, res: Response) => {
  return res.sendFile(path.join(process.cwd(), 'src', 'public', 'test.html'));
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    googleConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: `${process.env.BE_BASE_URL}/api/auth/google/callback`,
  });
});

// default route
app.get('/', (req: Request, res: Response) => {
  res.send('welcome to the Google OAuth 2.0 + JWT Node.js app!');
});

// start the server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();