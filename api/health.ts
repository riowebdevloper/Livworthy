export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'HEALTHY',
    version: '1.2.0',
    platform: 'LivWorthy Enterprise Intelligence',
    timestamp: new Date().toISOString(),
  });
}
