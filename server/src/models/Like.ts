import mongoose, { Document, Schema, Types } from 'mongoose';

export type FeedTargetType = 'announcement' | 'group_post' | 'blog_post';

export const FEED_TARGET_TYPES: FeedTargetType[] = ['announcement', 'group_post', 'blog_post'];

export interface ILike extends Document {
  targetType: FeedTargetType;
  targetId: Types.ObjectId;
  user: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    targetType: { type: String, enum: FEED_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

likeSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);
