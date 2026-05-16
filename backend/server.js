import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { trainModel } from './nlp/nlpManager.js';
import { chatbotHandler } from './nlp/chatbotHandler.js';
import seedProducts from './utils/seedProducts.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const port = process.env.PORT || 5001;

// Connect to Database, seed products, and train NLP
const startServer = async () => {
  await connectDB();
  await seedProducts();
  await trainModel();

  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running normally' });
  });

  // =============================================
  // SOCKET.IO — Real-time Chatbot Communication
  // =============================================
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('chatMessage', async (msg) => {
      try {
        // msg = { text, sessionId, userId }
        const response = await chatbotHandler.handleMessage(
          msg.text,
          msg.sessionId,
          msg.userId || null
        );
        socket.emit('botMessage', response);
      } catch (error) {
        console.error('Chatbot error:', error);
        socket.emit('botMessage', {
          text: "Sorry, something went wrong. Please try again.",
          type: 'text',
          intent: 'error',
          score: 0,
          data: {},
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  });
};

startServer();
