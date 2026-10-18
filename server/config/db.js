const mongoose = require('mongoose');

let isConnected = false;
let fallbackMode = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-image-restoration';
  
  try {
    // Attempt connecting to MongoDB with a short timeout to prevent blocking if Mongo is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    fallbackMode = false;
    console.log(`[MongoDB] Connected successfully to: ${uri.replace(/\/\/.*@/, '//<hidden>@')}`);
  } catch (error) {
    isConnected = false;
    fallbackMode = true;
    try {
      await mongoose.disconnect();
    } catch (_) {}
    console.warn(`[MongoDB Warning] Could not connect to MongoDB server: ${error.message}`);
    console.log(`[Database Fallback] Running with robust embedded local storage for users and restoration history.`);
    console.log(`[Database Tip] To connect real MongoDB, start mongod locally or set MONGODB_URI in server/.env (e.g. MongoDB Atlas URI).`);
  }
};

const getDbStatus = () => ({
  type: fallbackMode ? 'Embedded JSON Fallback' : 'MongoDB (Mongoose)',
  connected: isConnected,
  fallbackMode
});

module.exports = { connectDB, getDbStatus };
