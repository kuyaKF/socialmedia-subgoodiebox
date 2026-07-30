import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
