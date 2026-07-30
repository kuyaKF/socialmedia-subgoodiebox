import mongoose, { Document, Schema, Types } from 'mongoose';

export type BlogBlockType = 'heading' | 'paragraph' | 'image';

export interface IBlogBlock {
  type: BlogBlockType;
  text?: string;
  url?: string;
  caption?: string;
}

const blogBlockSchema = new Schema<IBlogBlock>(
  {
    type: { type: String, required: true, enum: ['heading', 'paragraph', 'image'] },
    text: { type: String, trim: true },
    url: { type: String, trim: true },
    caption: { type: String, trim: true },
  },
  { _id: false }
);

export interface IBlogPost extends Document {
  author: Types.ObjectId;
  title: string;
  blocks: IBlogBlock[];
  createdAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    blocks: {
      type: [blogBlockSchema],
      required: true,
      validate: {
        validator: (b: IBlogBlock[]) => Array.isArray(b) && b.length > 0,
        message: 'A blog post needs at least one block',
      },
    },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
