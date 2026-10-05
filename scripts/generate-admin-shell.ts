import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const source = path.join(distDir, 'index.html');
const targetDir = path.join(distDir, 'admin');
const target = path.join(targetDir, 'index.html');

if (!fs.existsSync(source)) {
  throw new Error('dist/index.html does not exist. Run the Vite build before generating the admin shell.');
}

fs.mkdirSync(targetDir, { recursive: true });
let html = fs.readFileSync(source, 'utf8');
if (!/<meta\s+name=["']robots["']/i.test(html)) {
  html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow, noarchive" />\n</head>');
} else {
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, nofollow, noarchive" />');
}
fs.writeFileSync(target, html);
console.log('[Admin] Generated dist/admin/index.html');
