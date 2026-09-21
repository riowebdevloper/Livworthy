export default async function handler(req: any, res: any) {
  try {
    const { app, ensureDatabaseReady } = await import('../server');
    await ensureDatabaseReady();
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: err.name || 'SERVERLESS_IMPORT_ERROR',
      message: err.message,
      stack: err.stack,
    });
  }
}
