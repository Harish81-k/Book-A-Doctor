import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node 17+ DNS resolution issues on Windows
dns.setDefaultResultOrder('ipv4first');

let isConnected = false;

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('MongoDB connection lost. Attempting to reconnect...');
  setTimeout(connectDB, 5000); // Retry when disconnected
});

const connectDB = async () => {
  if (isConnected) return; // Prevent multiple connections

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-a-doctor', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection failed at startup: ${error.message}`);
    console.error('The server will continue running. Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

export const getConnectionStatus = () => isConnected;

export default connectDB;
