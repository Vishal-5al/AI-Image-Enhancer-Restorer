const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const samplesDir = path.join(__dirname, '..', 'public', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

async function createSamples() {
  console.log('[Samples] Creating built-in realistic test images...');

  // Sample 1: Low-Resolution Portrait (pixelated, compressed)
  const svgPortrait = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fba478"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <circle cx="200" cy="170" r="90" fill="url(#skin)"/>
    <ellipse cx="200" cy="330" rx="140" ry="90" fill="#334155"/>
    <circle cx="165" cy="155" r="14" fill="#1e293b"/>
    <circle cx="235" cy="155" r="14" fill="#1e293b"/>
    <circle cx="169" cy="151" r="4" fill="#ffffff"/>
    <circle cx="239" cy="151" r="4" fill="#ffffff"/>
    <path d="M 175 205 Q 200 230 225 205" stroke="#9a3412" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M 197 165 L 193 185 L 207 185" stroke="#c2410c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="200" y="380" font-family="sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle" font-weight="bold">Low-Res Portrait Sample (320px)</text>
  </svg>`;

  // Create low-res and downscaled sample
  const portraitBuf = Buffer.from(svgPortrait);
  await sharp(portraitBuf)
    .resize(160, 160) // downscale heavily to make it low-res
    .resize(320, 320, { kernel: 'nearest' }) // pixelate
    .jpeg({ quality: 50 })
    .toFile(path.join(samplesDir, 'sample-lowres.jpg'));

  // Sample 2: Blurred Photo (Motion/lens blur)
  const svgBlurred = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="70%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#sky)"/>
    <rect y="260" width="400" height="140" fill="#1e293b"/>
    <!-- Buildings & Architecture -->
    <rect x="30" y="140" width="60" height="120" fill="#0f172a"/>
    <rect x="110" y="80" width="80" height="180" fill="#334155"/>
    <rect x="210" y="110" width="70" height="150" fill="#1e293b"/>
    <rect x="300" y="160" width="60" height="100" fill="#475569"/>
    <!-- Windows -->
    <rect x="130" y="100" width="10" height="15" fill="#fef08a"/>
    <rect x="150" y="100" width="10" height="15" fill="#fef08a"/>
    <rect x="130" y="130" width="10" height="15" fill="#fef08a"/>
    <rect x="150" y="130" width="10" height="15" fill="#fef08a"/>
    <circle cx="80" cy="70" r="35" fill="#fef08a"/>
    <text x="200" y="380" font-family="sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle" font-weight="bold">Blurred Architecture Sample</text>
  </svg>`;

  const blurBuf = Buffer.from(svgBlurred);
  await sharp(blurBuf)
    .blur(5) // apply heavy blur
    .jpeg({ quality: 70 })
    .toFile(path.join(samplesDir, 'sample-blurred.jpg'));

  // Sample 3: Historical / Vintage Sepia Faded Photo
  const svgVintage = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#e8dcc4"/>
    <circle cx="200" cy="180" r="110" fill="#d2bba0"/>
    <ellipse cx="200" cy="350" rx="160" ry="100" fill="#a89278"/>
    <circle cx="160" cy="160" r="12" fill="#715c48"/>
    <circle cx="240" cy="160" r="12" fill="#715c48"/>
    <path d="M 180 220 Q 200 235 220 220" stroke="#715c48" stroke-width="4" fill="none"/>
    <path d="M 140 135 Q 165 125 185 135" stroke="#544333" stroke-width="5" fill="none"/>
    <path d="M 215 135 Q 235 125 260 135" stroke="#544333" stroke-width="5" fill="none"/>
    <!-- Vintage scratches & border -->
    <rect x="15" y="15" width="370" height="370" stroke="#8c735a" stroke-width="3" fill="none"/>
    <line x1="50" y1="20" x2="350" y2="380" stroke="#f4ede0" stroke-width="1.5" stroke-dasharray="8,14"/>
    <line x1="320" y1="40" x2="80" y2="360" stroke="#f4ede0" stroke-width="1" stroke-dasharray="5,20"/>
    <text x="200" y="380" font-family="serif" font-size="15" fill="#544333" text-anchor="middle" font-weight="bold">Historical Archival Print (1942)</text>
  </svg>`;

  const vintageBuf = Buffer.from(svgVintage);
  await sharp(vintageBuf)
    .modulate({ brightness: 0.95, saturation: 0.6 })
    .jpeg({ quality: 65 })
    .toFile(path.join(samplesDir, 'sample-vintage.jpg'));

  console.log('[Samples] Generated sample-lowres.jpg, sample-blurred.jpg, sample-vintage.jpg successfully!');
}

createSamples().catch(console.error);
