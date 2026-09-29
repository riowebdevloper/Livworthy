import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeIcons() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const masterPngPath = path.join(publicDir, 'icon-master.png');
  const svgPath = path.join(publicDir, 'icon.svg');

  const sourceBuffer = fs.existsSync(masterPngPath)
    ? fs.readFileSync(masterPngPath)
    : fs.existsSync(svgPath)
    ? fs.readFileSync(svgPath)
    : null;

  if (sourceBuffer) {
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'icon.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      const buf = await sharp(sourceBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, quality: 95 })
        .toBuffer();

      fs.writeFileSync(path.join(publicDir, name), buf);
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, name), buf);
      }
      console.log(`Generated ${name} (${size}x${size}): ${buf.length} bytes`);
    }

    // Generate multi-resolution favicon.ico (16x16, 32x32, 48x48)
    const p16 = await sharp(sourceBuffer).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const p32 = await sharp(sourceBuffer).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const p48 = await sharp(sourceBuffer).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

    const icoImages = [
      { width: 16, height: 16, buffer: p16 },
      { width: 32, height: 32, buffer: p32 },
      { width: 48, height: 48, buffer: p48 },
    ];

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(icoImages.length, 4);

    let offset = 6 + icoImages.length * 16;
    const entries: Buffer[] = [];
    for (const img of icoImages) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(img.buffer.length, 8);
      entry.writeUInt32LE(offset, 12);
      offset += img.buffer.length;
      entries.push(entry);
    }

    const icoBuf = Buffer.concat([header, ...entries, ...icoImages.map(i => i.buffer)]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuf);
    }
    console.log(`Generated multi-resolution favicon.ico: ${icoBuf.length} bytes`);
  }

  // Optimize Logo into responsive WebP and PNG formats
  const logoPath = path.join(publicDir, 'logo.png');
  if (fs.existsSync(logoPath)) {
    const webp300 = await sharp(logoPath).resize(300, 100, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).webp({ quality: 90, effort: 6 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'logo-300.webp'), webp300);
    if (fs.existsSync(distDir)) fs.writeFileSync(path.join(distDir, 'logo-300.webp'), webp300);

    const webp600 = await sharp(logoPath).resize(600, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).webp({ quality: 90, effort: 6 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'logo-600.webp'), webp600);
    fs.writeFileSync(path.join(publicDir, 'logo.webp'), webp600);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'logo-600.webp'), webp600);
      fs.writeFileSync(path.join(distDir, 'logo.webp'), webp600);
    }

    const png300 = await sharp(logoPath).resize(300, 100, { fit: 'contain' }).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'logo-300.png'), png300);
    if (fs.existsSync(distDir)) fs.writeFileSync(path.join(distDir, 'logo-300.png'), png300);

    const png600 = await sharp(logoPath).resize(600, 200, { fit: 'contain' }).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'logo-600.png'), png600);
    if (fs.existsSync(distDir)) fs.writeFileSync(path.join(distDir, 'logo-600.png'), png600);

    console.log(`Generated responsive logo assets: logo-300.webp (${webp300.length} B), logo-600.webp (${webp600.length} B)`);
  }
}

optimizeIcons().catch(console.error);
