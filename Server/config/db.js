import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS resolvers work reliably for mongodb+srv URLs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore if not supported
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/skywork_hrms');

  if (!uri) {
    console.warn('⚠️ MONGODB_URI environment variable is not configured!');
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

export default connectDB;
