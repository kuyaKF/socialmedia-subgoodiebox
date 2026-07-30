import mongoose, { Document, Schema, Types } from 'mongoose';

export type GroupPostVisibility = 'private' | 'public';

export interface IGroupPost extends Document {
  group: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  visibility: GroupPostVisibility;
  createdAt: Date;
}

const groupPostSchema = new Schema<IGroupPost>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    // Private posts are only ever surfaced to the group's own members; public posts also show
    // up in the general feed for everyone, per createGroupPost's leader-only opt-in.
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  },
  { timestamps: true }
);

export const GroupPost = mongoose.model<IGroupPost>('GroupPost', groupPostSchema);
