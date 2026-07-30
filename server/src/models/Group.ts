import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  leader: Types.ObjectId | null;
  members: Types.ObjectId[];
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    leader: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);
