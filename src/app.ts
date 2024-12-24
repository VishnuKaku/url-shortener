// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const rateLimiter = new RateLimiter();

app.use(errorHandler);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter.middleware);

app.use('/auth', authRoutes);
app.use('/api', urlRoutes);

export default app;