import mongoose, { Schema } from 'mongoose';
import type { IAdmin } from '../types/admin.type.js';
import { passwordPlugin } from '../plugins/password.plugin.js';

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.plugin(passwordPlugin);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
