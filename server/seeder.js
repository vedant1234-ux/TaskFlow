const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Task.deleteMany();

    await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'admin',
    });
    
    await User.create({
      name: 'Demo User',
      email: 'demo@taskflow.com',
      password: 'demo123',
      role: 'user',
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
