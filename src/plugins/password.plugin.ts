import type { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export const passwordPlugin = (schema: Schema) => {
  schema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
  });

  schema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  };
};
