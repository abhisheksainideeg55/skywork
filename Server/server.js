import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Database & utilities
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import smartAttendanceRoutes from './routes/smartAttendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import wfhRoutes from './routes/wfhRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import breakRoutes from './routes/breakRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import overtimeRoutes from './routes/overtimeRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import { ensureSuperAdmin } from './utils/createSuperAdmin.js';

// Setup environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Express app & HTTP server
const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Pass io to express app
app.set('io', io);

// Socket.io Real-time Event handlers
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join user room (e.g. employeeId or role)
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`👤 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files for uploaded documents & avatars
app.use('/uploads', express.static(uploadsDir));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    version: '1.0.0',
    service: 'Skywork Enterprise HRMS API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance/smart', smartAttendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/wfh', wfhRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/overtimes', overtimeRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Error handling for HTTP server (including EADDRINUSE)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`💡 Tip: Please terminate any existing Node process on port ${PORT} or check running instances.\n`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const conn = await connectDB();

    if (conn) {
      console.log('✅ Database connected successfully.');
      await ensureSuperAdmin();
    }

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║               🚀 SKYWORK HRMS ENTERPRISE BACKEND ONLINE                 ║
╠══════════════════════════════════════════════════════════════════════════╣
║  • API Server    : http://localhost:${PORT}                               ║
║  • Health Check  : http://localhost:${PORT}/api/health                      ║
║  • WebSocket     : ws://localhost:${PORT} (Socket.io)                      ║
║  • Environment   : ${process.env.NODE_ENV || 'development'}                           ║
╚══════════════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export { app, server, io };

