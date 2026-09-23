import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS resolvers work reliably for mongodb+srv URLs on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore if not supported
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skywork_hrms');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue without database. Data will not persist.');
    return null;
  }
};

export default connectDB;
