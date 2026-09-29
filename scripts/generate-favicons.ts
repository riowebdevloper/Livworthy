import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFavicons() {
  const inputPath = '/Users/laptopbazaar/.gemini/antigravity-ide/brain/83b78519-6534-412c-91d6-dc008792b5b8/.user_uploaded/media_1790664278410.jpg';
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input image not found at ${inputPath}`);
  }

  console.log(`[Favicon Generator] Reading source image: ${inputPath}`);
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Flood fill from exterior corners to detect white background
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const isOuterBg = (x: number, y: number) => {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r > 210 && g > 210 && b > 210;
  };

  const initPoints = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
  ];

  for (const [ix, iy] of initPoints) {
    const pos = iy * width + ix;
    if (!visited[pos] && isOuterBg(ix, iy)) {
      visited[pos] = 1;
      queue.push(ix, iy);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const npos = ny * width + nx;
        if (!visited[npos] && isOuterBg(nx, ny)) {
          visited[npos] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  console.log(`[Favicon Generator] Identified ${queue.length / 2} exterior background pixels.`);

  // Create RGBA buffer with transparent exterior and antialiased squircle edge
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;
      const isBg = visited[y * width + x] === 1;

      rgba[dstIdx] = data[srcIdx];
      rgba[dstIdx + 1] = data[srcIdx + 1];
      rgba[dstIdx + 2] = data[srcIdx + 2];

      if (isBg) {
        rgba[dstIdx + 3] = 0;
      } else {
        let bgNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (visited[ny * width + nx] === 1) bgNeighbors++;
            }
          }
        }
        if (bgNeighbors > 0) {
          rgba[dstIdx + 3] = Math.round(255 * (1 - (bgNeighbors / 9) * 0.45));
        } else {
          rgba[dstIdx + 3] = 255;
        }
      }
    }
  }

  // Convert raw RGBA to PNG buffer first, then trim any outer transparent padding
  const rawPng = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  const trimmed = await sharp(rawPng)
    .trim()
    .png({ compressionLevel: 9 })
    .toBuffer();

  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');

  // Save master transparent icon
  const masterPath = path.join(publicDir, 'icon-master.png');
  fs.writeFileSync(masterPath, trimmed);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'icon-master.png'), trimmed);
  }
  console.log(`[Favicon Generator] Saved master icon: ${masterPath} (${trimmed.length} bytes)`);

  // Target standard sizes
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
    const buf = await sharp(trimmed)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), buf);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, name), buf);
    }
    console.log(`[Favicon Generator] Created ${name} (${size}x${size}): ${buf.length} bytes`);
  }

  // Generate Multi-Resolution favicon.ico (16x16, 32x32, 48x48)
  const p16 = await sharp(trimmed).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const p32 = await sharp(trimmed).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const p48 = await sharp(trimmed).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  const icoImages = [
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 },
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format type
  header.writeUInt16LE(icoImages.length, 4); // Number of images

  let offset = 6 + icoImages.length * 16;
  const entries: Buffer[] = [];
  for (const img of icoImages) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Colors (0 = >= 8bpp)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset
    offset += img.buffer.length;
    entries.push(entry);
  }

  const icoBuf = Buffer.concat([header, ...entries, ...icoImages.map(i => i.buffer)]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuf);
  }
  console.log(`[Favicon Generator] Created multi-resolution favicon.ico (${icoBuf.length} bytes)`);
}

generateFavicons()
  .then(() => console.log('[Favicon Generator] All icons successfully generated!'))
  .catch((err) => {
    console.error('[Favicon Generator] Error:', err);
    process.exit(1);
  });
