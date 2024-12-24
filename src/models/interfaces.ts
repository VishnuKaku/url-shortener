import { Types } from 'mongoose';

export interface IUser {
  email: string;
  created_at: Date;
}

export interface IURL {
  user_id: Types.ObjectId;
  long_url: string;
  short_code: string;
  topic?: string;
  created_at: Date;
}

export interface IAnalytics {
  url_id: Types.ObjectId;
  visitor_ip: string;
  user_agent: string;
  timestamp: Date;
  os_type: string;
  device_type: string;
  country: string;    // Added new field
  city: string;       // Added new field
}