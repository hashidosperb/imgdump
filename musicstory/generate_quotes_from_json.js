const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const BG_DIR = path.join(__dirname, 'music_bgs2');
const FONT_DIR = path.join(__dirname, '..', 'Syne_Mono');

function ensureFontInstalled() {
  const fontFileName = 'SyneMono-Regular.ttf';
  const sourcePath = path.join(FONT_DIR, fontFileName);
  if (!fs.existsSync(sourcePath)) return;

  const platform = os.platform();
  let targetDir = null;

  if (platform === 'darwin') {
    targetDir = path.join(os.homedir(), 'Library', 'Fonts');
  } else if (platform === 'linux') {
    targetDir = path.join(os.homedir(), '.local', 'share', 'fonts');
  } else if (platform === 'win32') {
    targetDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts');
  }

  if (targetDir) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, fontFileName);
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Installed custom font to ${targetPath}`);
      }
    } catch (e) {
      console.warn('Could not auto-install font:', e.message);
    }
  }
}

ensureFontInstalled();

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const CONTENT_WIDTH = 700;
const CONTENT_HEIGHT = 500;
const MIN_FONT_SIZE = 30;
const MAX_FONT_SIZE = 70;
const FONT_FAMILY = "'Syne Mono', monospace";

const templates = {
  default: [
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ffe1c8ff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ccdfffff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ffcfd8ff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#c9ffdeff' },

    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#80001a' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#003a1e' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#8f0000' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#770046' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#21008b' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#950101' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#000146' },
  ]
};

function templateFor(index) {
  const set = templates.default;
  return set[index % set.length];
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizedQuote(quote) {
  return String(quote || '')
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\u200D/g, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function charWeight(str) {
  let w = 0;
  for (const ch of str) {
    if ('ilI.,:;|!'.includes(ch)) w += 0.45;
    else if ('mwMW@#%&'.includes(ch)) w += 1.2;
    else w += 0.9;
  }
  return w;
}

function wrapText(text, maxUnits) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!word) continue;

    if (charWeight(word) > maxUnits) {
      if (current) {
        lines.push(current);
        current = '';
      }
      let chunk = '';
      for (const ch of word) {
        const next = chunk + ch;
        if (charWeight(next) <= maxUnits) {
          chunk = next;
        } else {
          lines.push(chunk);
          chunk = ch;
        }
      }
      if (chunk) current = chunk;
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (charWeight(candidate) <= maxUnits) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function fitText(text, maxWidth, maxHeight) {
  for (let fontSize = MAX_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize -= 2) {
    const avgCharPx = fontSize * 0.56;
    const maxUnits = maxWidth / avgCharPx;
    const lines = wrapText(text, maxUnits);
    const lineHeight = Math.round(fontSize * 1.3);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight && lines.length <= 12) {
      return { lines, fontSize, lineHeight, totalHeight };
    }
  }

  const fallbackSize = MIN_FONT_SIZE;
  const fallbackLines = wrapText(text, maxWidth / (fallbackSize * 0.56));
  return {
    lines: fallbackLines.slice(0, 15),
    fontSize: fallbackSize,
    lineHeight: Math.round(fallbackSize * 1.3),
    totalHeight: Math.round(fallbackLines.slice(0, 15).length * fallbackSize * 1.3)
  };
}

function buildSvg({ quote, label, style, textFit }) {
  const lines = textFit.lines.map(escapeXml);
  const quoteBlockHeight = textFit.totalHeight;
  // const quoteStartY = 800
  const quoteStartY = 300 + Math.round((CANVAS_HEIGHT - quoteBlockHeight) / 2 + textFit.lineHeight * 0.78) - 30;
  // const marginLeft = (CANVAS_WIDTH - CONTENT_WIDTH) / 2;
  const marginLeft = 130;

  const tspans = lines
    .map((line, i) => `<tspan x="${marginLeft}" dy="${i === 0 ? 0 : textFit.lineHeight}">${line}</tspan>`)
    .join('');

  return `
<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Syne Mono';
        src: local('Syne Mono'), local('SyneMono-Regular');
        font-weight: 400;
        font-style: normal;
      }
    </style>
  </defs>

  <!-- Dark overlay with 60% opacity -->
  <rect width="100%" height="100%" fill="#000000" fill-opacity="0" />

  <text x="${marginLeft}" y="${quoteStartY}" text-anchor="start" font-family="${FONT_FAMILY}" font-size="${textFit.fontSize}" font-weight="700" fill="${style.text}">
    ${tspans}
  </text>

  <text x="${CANVAS_WIDTH / 2}" y="${CANVAS_HEIGHT - 100}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" fill="${style.text}" opacity="0.88">@myfavoriteplaylists</text>
</svg>`.trim();
}

function toCsvValue(value) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

async function generate(inputPath, outputDir, outputFile) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const items = JSON.parse(raw);

  fs.mkdirSync(outputDir, { recursive: true });

  const manifest = [];

  // Read background images once, cycle through them per quote
  const bgFiles = fs.readdirSync(BG_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();

  for (let i = 0; i < items.length; i++) {
    const item = items[i] || {};
    const id = item.id || (i + 1);
    const label = String(item.category_label || '').trim();
    let quote = normalizedQuote(item.content)

    if (!quote) continue;

    // Add quotes around the quote text
    // quote = '"' + quote + '"';

    const style = templateFor(i);
    const textFit = fitText(quote, CONTENT_WIDTH, CONTENT_HEIGHT);
    const svg = buildSvg({ quote, label, style, textFit });

    const filename = `${String(id).padStart(4, '0')}-quote.jpg`;
    const outPath = path.join(outputDir, filename);

    const bgFile = bgFiles[i % bgFiles.length];
    const bgPath = path.join(BG_DIR, bgFile);

    // Resize bg image to canvas (cover), then composite SVG text on top
    await sharp(bgPath)
      .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: 'cover', position: 'centre' })
      .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0
      }])
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(outPath);

    const imageUrl = `https://hashidosperb.github.io/igimages/sendthis_master_quotes_story/${filename}`;
    const description = `${item.caption}\n${item.hashtags} - @myfavoriteplaylists`;

    manifest.push({
      description,
      image_url: imageUrl
    });

    if ((i + 1) % 100 === 0 || i === items.length - 1) {
      console.log(`Generated ${i + 1}/${items.length}`);
    }
  }

  const csvHeader = ['description', 'image_url'];
  const csvRows = manifest.map((row) => [
    toCsvValue(row.description),
    toCsvValue(row.image_url)
  ].join(','));

  const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
  fs.writeFileSync(outputFile, `${csvContent}\n`);

  console.log(`Done. Created ${manifest.length} images.`);
  console.log(`CSV saved to: ${outputFile}`);
}

const inputPath = process.argv[2] || path.join(__dirname, 'singers_posts_100.json');
const outputDir = process.argv[3] || path.join(__dirname, 'singers_posts_100');
const outputFile = process.argv[4] || path.join(__dirname, 'singers_posts_100.csv');

generate(inputPath, outputDir, outputFile).catch((err) => {
  console.error('Generation failed:', err.message);
  process.exit(1);
});
