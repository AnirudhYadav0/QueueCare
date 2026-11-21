require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

const run = async () => {
  try {
    await connectDB();
    const result = await seedDatabase();
    console.log('Seed summary:', result);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seed runner failed:', error);
    process.exit(1);
  }
};

run();
