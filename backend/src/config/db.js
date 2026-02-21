import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      'MongoDB connection error: MONGODB_URI is not set.\n' +
      'Create a .env file in the backend folder (copy from .env.example) and set MONGODB_URI.'
    );
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
