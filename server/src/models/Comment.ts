import mongoose, { Document, Schema, Types } from 'mongoose';
import { FEED_TARGET_TYPES, FeedTargetType } from './Like';

export interface IComment extends Document {
  targetType: FeedTargetType;
  targetId: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    targetType: { type: String, enum: FEED_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
