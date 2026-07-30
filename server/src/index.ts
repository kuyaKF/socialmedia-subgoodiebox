import { app } from './app';
import { env } from './config/env';
import { connectDb } from './db/connect';

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
