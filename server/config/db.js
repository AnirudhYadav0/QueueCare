const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queuecare';
  
  try {
    // Attempt standard connection with 3s serverSelectionTimeoutMS
    console.log(`Connecting to MongoDB at: ${uri.replace(/:\/\/.*@/, '://<credentials>@')}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`Standard MongoDB connection failed: ${err.message}`);
    
    // Fallback: If in development or test, try mongodb-memory-server
    if (process.env.NODE_ENV !== 'production' || !process.env.MONGODB_URI) {
      try {
        console.log('Attempting in-memory MongoDB fallback for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`Connected to in-memory MongoDB instance: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr.message);
      }
    }

    console.error('Database connection error. Exiting process.');
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
