import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  default_role: {
    type: String,
    default: ''
  },
  resumes: [
    {
      id: String,
      timestamp: String
    }
  ],
  activity: {
    type: Map,
    of: {
      role: String,
      checkboxes: {
        type: Map,
        of: Boolean
      },
      timestamp: String
    },
    default: {}
  }
}, { timestamps: true });

// Explicitly bind this Mongoose Model to the "userdetails" collection in MongoDB
const UserActivity = mongoose.model('UserActivity', UserActivitySchema, 'userdetails');
export default UserActivity;
