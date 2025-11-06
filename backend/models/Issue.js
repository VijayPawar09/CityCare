const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['road', 'water', 'electricity', 'garbage', 'other'], default: 'other' },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  // history of status changes
  statusHistory: [
    {
      status: { type: String, enum: ['pending', 'in-progress', 'resolved'] },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date },
      note: { type: String },
      actorRole: { type: String, enum: ['citizen', 'volunteer', 'admin', 'unknown'], default: 'unknown' }
    }
  ],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  image: { type: String },
  location: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
