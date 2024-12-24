import mongoose, { Document, Schema } from 'mongoose';
import { IAnalytics } from './interfaces';

export interface AnalyticsDocument extends IAnalytics, Document {}

const AnalyticsSchema = new Schema<AnalyticsDocument>({
  url_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'URL',
    required: true
  },
  visitor_ip: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  os_type: {
    type: String,
    required: true
  },
  device_type: {
    type: String,
    required: true
  },
  country: {            // Added
    type: String,
    required: true,
    default: 'Unknown'  // Added default value
  },
  city: {              // Added
    type: String,
    required: true,
    default: 'Unknown'  // Added default value
  }
});

// Index for faster analytics queries
AnalyticsSchema.index({ url_id: 1, timestamp: -1 });
AnalyticsSchema.index({ url_id: 1, os_type: 1 });
AnalyticsSchema.index({ url_id: 1, device_type: 1 });
AnalyticsSchema.index({ url_id: 1, country: 1 });  // Added new index for country queries

export const Analytics = mongoose.model<AnalyticsDocument>('Analytics', AnalyticsSchema);