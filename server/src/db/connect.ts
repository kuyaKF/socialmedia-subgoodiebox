import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from '../config/env';

// Some networks/routers block or drop DNS SRV queries, which mongodb+srv:// URIs depend
// on to discover replica set members. Falling back to public DNS resolvers avoids hangs
// on those networks. Harmless no-op on networks where SRV lookups already work.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log('[db] connected');
}
