import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBlogPost extends Document {
  author: Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
