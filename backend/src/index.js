import express from 'express'
import cors from 'cors';
import connectDB from './config/mongoDB.js';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import mainRoute from './routes/index.js';
import { initSocket } from './services/socket.js';
import HasCheckedWorker from './workers/hasChecked.worker.js';

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000"
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

    initSocket(server);

    const hasCheckedWorker = new HasCheckedWorker();
    await hasCheckedWorker.start();

    const shutdown = async () => {
      console.log('Shutting down...');
      await hasCheckedWorker.stop();
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