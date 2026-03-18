import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const svgBuffer = fs.readFileSync('./public/favicon.svg');

async function generate() {
  // Ensure icon and images directories exist
  fs.mkdirSync('./public/icons', { recursive: true });
  fs.mkdirSync('./public/images', { recursive: true });

  // 1. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('./public/apple-touch-icon.png');
    
  // 2. favicon-32x32.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('./public/favicon-32x32.png');
    
  // 3. PWA Icons (192, 512)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('./public/icons/icon-192.png');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('./public/icons/icon-512.png');
    
  // 4. PWA Maskable Icons (192, 512)
  // For maskable, we add a solid background to ensure it's safe if cropped
  // We can just increase padding slightly
  await sharp(svgBuffer)
    .resize(192, 192, { fit: 'contain', background: '#0A0A0F' })
    .png()
    .toFile('./public/icons/icon-maskable-192.png');
  await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: '#0A0A0F' })
    .png()
    .toFile('./public/icons/icon-maskable-512.png');
    
  // 5. og-image.png (1200x630)
  const ogSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0F"/>
          <stop offset="100%" style="stop-color:#1A1A2E"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect fill="url(#bg)" width="1200" height="630"/>
      <g transform="translate(100, 150)">
        <text x="0" y="80" font-family="monospace, sans-serif" font-size="120" font-weight="bold" fill="#00FFFF" filter="url(#glow)">&gt;_</text>
        <text x="0" y="240" font-family="sans-serif" font-size="72" font-weight="bold" fill="#FFFFFF">Alvaro Quintana</text>
        <text x="0" y="320" font-family="sans-serif" font-size="36" fill="#A0A0B0">Desarrollador Mobile &amp; IA | Kotlin Multiplatform</text>
      </g>
    </svg>
  `;
  
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile('./public/images/og-image.png');
    
  console.log("Images generated successfully!");
}

generate().catch(console.error);
