import mongoose, { Document, Schema } from 'mongoose';
import { IURL } from './interfaces';

export interface URLDocument extends IURL, Document {}

const URLSchema = new Schema<URLDocument>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  // Changed this line
    ref: 'User',
    required: true
  },
  long_url: {
    type: String,
    required: true
  },
  short_code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true,
    lowercase: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
URLSchema.index({ short_code: 1 });
URLSchema.index({ user_id: 1, topic: 1 });

export const URL = mongoose.model<URLDocument>('URL', URLSchema);