import express from 'express'
import cors from 'cors';
import connectDB from './config/mongoDB.js';
import 'dotenv/config';

import mainRoute from './routes/index.js';

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use("/api", mainRoute);

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down...');
      server.close(() => console.log('HTTP server closed'));
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
  catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();