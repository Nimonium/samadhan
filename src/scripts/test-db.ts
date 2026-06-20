import connectToDatabase from '../lib/db';

async function run() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectToDatabase();
    console.log("MongoDB connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

run();
