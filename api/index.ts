import app, { ensureDatabaseReady } from '../server';

export default async function handler(req: any, res: any) {
  await ensureDatabaseReady();
  return app(req, res);
}
