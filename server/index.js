import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserActivity from './models/UserActivity.js';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection with explicit database "userid"
const MONGO_URI = "mongodb+srv://shammatthew04_db_user:Y3C0UZjmOBwC4B4c@cluster0.esjtml7.mongodb.net/userid?retryWrites=true&w=majority";

// Disable buffering globally so API calls fail instantly if connection is blocked
mongoose.set('bufferCommands', false);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is blocked by college network
})
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => {
    console.error('CRITICAL: MongoDB connection error. You are likely on a restricted network blocking access:', err.message);
  });

// GET User Data
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    let user = await UserActivity.findOne({ email });
    
    // If not exists, return custom null to mimic old Firestore logic
    if (!user) {
      return res.status(200).json(null);
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST / PUT: Update or Create User Data
app.post('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;
    
    const user = await UserActivity.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, upsert: true } // Upsert creates if it doesn't exist
    );
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Dashboard API running on http://localhost:${PORT}`);
});
