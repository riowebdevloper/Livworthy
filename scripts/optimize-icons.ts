import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeIcons() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'icon.svg');

  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found in public/');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, quality: 90 })
      .toFile(outPath);

    const stat = fs.statSync(outPath);
    console.log(`Generated ${name} (${size}x${size}): ${stat.size} bytes`);
  }

  // Generate standard 32x32 favicon.ico
  const ico32Buffer = await sharp(svgBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32Buffer);
  console.log(`Generated favicon.ico: ${ico32Buffer.length} bytes`);
}

optimizeIcons().catch(console.error);
