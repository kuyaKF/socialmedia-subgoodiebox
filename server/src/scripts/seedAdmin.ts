import { env } from '../config/env';
import { connectDb } from '../db/connect';
import { User } from '../models/User';
import mongoose from 'mongoose';

async function main() {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed an admin user');
  }

  await connectDb();

  const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[seed:admin] promoted existing user ${existing.email} to admin`);
    } else {
      console.log(`[seed:admin] admin ${existing.email} already exists`);
    }
  } else {
    const admin = await User.create({
      email: env.adminEmail,
      passwordHash: env.adminPassword,
      name: env.adminName,
      role: 'admin',
    });
    console.log(`[seed:admin] created admin user ${admin.email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed:admin] failed', err);
  process.exit(1);
});
