import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/samadhan-test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  (global as any).mongoose = { conn: mongoose, promise: Promise.resolve(mongoose) };
});

afterAll(async () => {
  await mongoose.disconnect();
});
