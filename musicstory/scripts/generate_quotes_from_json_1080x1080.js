const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const BG_DIR = path.join(__dirname, '../backgrounds', 'ilu_bgs1');

const FONTS = [
  {
    name: 'Barrio',
    dirName: 'Barrio',
    fileName: 'Barrio-Regular.ttf',
    family: "'Barrio', monospace"
  },
  {
    name: 'Bonbon',
    dirName: 'Bonbon',
    fileName: 'Bonbon-Regular.ttf',
    family: "'Bonbon', monospace"
  },
  {
    name: 'Butterfly Kids',
    dirName: 'Butterfly_Kids',
    fileName: 'ButterflyKids-Regular.ttf',
    family: "'Butterfly Kids', monospace"
  },
  {
    name: 'Caacupe One',
    dirName: 'Caacupe_One',
    fileName: 'CaacupeOne-Regular.ttf',
    family: "'Caacupe One', monospace"
  },
  {
    name: 'Carter One',
    dirName: 'Carter_One',
    fileName: 'CarterOne-Regular.ttf',
    family: "'Carter One', monospace"
  },
  {
    name: 'Caveat Brush',
    dirName: 'Caveat_Brush',
    fileName: 'CaveatBrush-Regular.ttf',
    family: "'Caveat Brush', monospace"
  },
  {
    name: 'Eater',
    dirName: 'Eater',
    fileName: 'Eater-Regular.ttf',
    family: "'Eater', monospace"
  },
  {
    name: 'Festive',
    dirName: 'Festive',
    fileName: 'Festive-Regular.ttf',
    family: "'Festive', monospace"
  },
  {
    name: 'Finger Paint',
    dirName: 'Finger_Paint',
    fileName: 'FingerPaint-Regular.ttf',
    family: "'Finger Paint', monospace"
  },
  {
    name: 'Flavors',
    dirName: 'Flavors',
    fileName: 'Flavors-Regular.ttf',
    family: "'Flavors', monospace"
  },
  {
    name: 'Fontdiner Swanky',
    dirName: 'Fontdiner_Swanky',
    fileName: 'FontdinerSwanky-Regular.ttf',
    family: "'Fontdiner Swanky', monospace"
  },
  {
    name: 'Henny Penny',
    dirName: 'Henny_Penny',
    fileName: 'HennyPenny-Regular.ttf',
    family: "'Henny Penny', monospace"
  },
  {
    name: 'Indie Flower',
    dirName: 'Indie_Flower',
    fileName: 'IndieFlower-Regular.ttf',
    family: "'Indie Flower', monospace"
  },
  {
    name: 'Kablammo',
    dirName: 'Kablammo',
    fileName: 'Kablammo-Regular-VariableFont_MORF.ttf',
    family: "'Kablammo', monospace"
  },
  {
    name: 'Kranky',
    dirName: 'Kranky',
    fileName: 'Kranky-Regular.ttf',
    family: "'Kranky', monospace"
  },
  {
    name: 'Londrina Shadow',
    dirName: 'Londrina_Shadow',
    fileName: 'LondrinaShadow-Regular.ttf',
    family: "'Londrina Shadow', monospace"
  },
  {
    name: 'Love Ya Like A Sister',
    dirName: 'Love_Ya_Like_A_Sister',
    fileName: 'LoveYaLikeASister-Regular.ttf',
    family: "'Love Ya Like A Sister', monospace"
  },
  {
    name: 'Luckiest Guy',
    dirName: 'Luckiest_Guy',
    fileName: 'LuckiestGuy-Regular.ttf',
    family: "'Luckiest Guy', monospace"
  },
  {
    name: 'Moirai One',
    dirName: 'Moirai_One',
    fileName: 'MoiraiOne-Regular.ttf',
    family: "'Moirai One', monospace"
  },
  {
    name: 'Moo Lah Lah',
    dirName: 'Moo_Lah_Lah',
    fileName: 'MooLahLah-Regular.ttf',
    family: "'Moo Lah Lah', monospace"
  },
  {
    name: 'Mountains of Christmas',
    dirName: 'Mountains_of_Christmas',
    fileName: 'MountainsofChristmas-Regular.ttf',
    family: "'Mountains of Christmas', monospace"
  },
  // {
  //   name: 'Mountains of Christmas Bold',
  //   dirName: 'Mountains_of_Christmas',
  //   fileName: 'MountainsofChristmas-Bold.ttf',
  //   family: "'Mountains of Christmas Bold', monospace"
  // },
  {
    name: 'Mystery Quest',
    dirName: 'Mystery_Quest',
    fileName: 'MysteryQuest-Regular.ttf',
    family: "'Mystery Quest', monospace"
  },
  {
    name: 'Rubik Iso',
    dirName: 'Rubik_Iso',
    fileName: 'RubikIso-Regular.ttf',
    family: "'Rubik Iso', monospace"
  },
  {
    name: 'Rubik Spray Paint',
    dirName: 'Rubik_Spray_Paint',
    fileName: 'RubikSprayPaint-Regular.ttf',
    family: "'Rubik Spray Paint', monospace"
  },
  {
    name: 'Syne Mono',
    dirName: 'Syne_Mono',
    fileName: 'SyneMono-Regular.ttf',
    family: "'Syne Mono', monospace"
  },
  {
    name: 'Unkempt',
    dirName: 'Unkempt',
    fileName: 'Unkempt-Regular.ttf',
    family: "'Unkempt', monospace"
  },
  // {
  //   name: 'Unkempt Bold',
  //   dirName: 'Unkempt',
  //   fileName: 'Unkempt-Bold.ttf',
  //   family: "'Unkempt Bold', monospace"
  // }
];
// const SELECT_FONT = FONTS[3];

function ensureFontsInstalled() {
  const platform = os.platform();
  let targetDir = null;

  if (platform === 'darwin') {
    targetDir = path.join(os.homedir(), 'Library', 'Fonts');
  } else if (platform === 'linux') {
    targetDir = path.join(os.homedir(), '.local', 'share', 'fonts');
  } else if (platform === 'win32') {
    targetDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts');
  }

  if (!targetDir) return;

  try {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const font of FONTS) {
      const sourcePath = path.join(__dirname, '../../fonts', font.dirName, font.fileName);
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(targetDir, font.fileName);
        if (!fs.existsSync(targetPath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Installed custom font (${font.name}) to ${targetPath}`);
        }
      }
    }
  } catch (e) {
    console.warn('Could not auto-install fonts:', e.message);
  }
}

ensureFontsInstalled();

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const CONTENT_WIDTH = 800;
const CONTENT_HEIGHT = 800;
const MIN_FONT_SIZE = 30;
const MAX_FONT_SIZE = 160;

const templates = {
  default: [
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ffe1c8ff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ccdfffff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#ffcfd8ff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#c9ffdeff' },

    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#40000dff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#002d17ff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#0e003eff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#380033ff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#000135ff' },

    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#000364ff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#003c1fff' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#4b3400ff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#c50000ff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#9b003bff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#d00050ff' },
    { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#9f0000ff' },

    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#31452c' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#3b299d' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#6b0325' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#023f72' },
    // { bg1: '#282828ff', bg2: '#282828ff', accent: '#AAAAAA', text: '#733ca2' },

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

function buildSvg({ quote, label, style, textFit, fontFamily }) {
  const lines = textFit.lines.map(escapeXml);
  const quoteBlockHeight = textFit.totalHeight;
  // const quoteStartY = 800
  // const quoteStartY = 300 + Math.round((CANVAS_HEIGHT - quoteBlockHeight) / 2 + textFit.lineHeight * 0.78) - 30;
  // const quoteStartY = Math.round(((CANVAS_HEIGHT) - quoteBlockHeight) / 2 + textFit.lineHeight * 1);
  const quoteStartY = ((CANVAS_HEIGHT) / 2) + (quoteBlockHeight / 4);
  const quoteStartX = ((CANVAS_WIDTH) / 2);
  //  - (quoteBlockHeight / 2);
  // console.log("quoteStartY : ", quoteStartY);
  // console.log("quoteBlockHeight : ", quoteBlockHeight);
  // console.log("textFit.lineHeight : ", textFit.lineHeight);
  // console.log("textFit : ", textFit);



  // const marginLeft = (CANVAS_WIDTH - CONTENT_WIDTH) / 2;
  const marginLeft = 0;

  const tspans = lines
    .map((line, i) => `<tspan x="${CANVAS_WIDTH / 2}" text-anchor="middle" dy="${i === 0 ? 0 : textFit.lineHeight}">${line}</tspan>`)
    .join('');

  return `
<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${FONTS.map(f => `
      @font-face {
        font-family: '${f.name}';
        src: local('${f.name}'), local('${f.fileName.replace(/\.ttf$/, '')}');
        font-weight: 400;
        font-style: normal;
      }`).join('')}
    </style>
  </defs>

  <!-- Dark overlay with 60% opacity -->
  <rect width="100%" height="100%" fill="#000000" fill-opacity="0" />

  <text x="${quoteStartX}" y="${quoteStartY}" text-anchor="start" font-family="${fontFamily}" font-size="${textFit.fontSize}" font-weight="700" fill="${style.text}">
    ${tspans}
  </text>

  <text x="${CANVAS_WIDTH / 2}" y="${CANVAS_HEIGHT - 80}" text-anchor="middle" font-family="Finger Paint" font-size="24" fill="${style.text}" opacity="0.88">@${igusername}</text>
</svg>`.trim();
}

function toCsvValue(value) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

async function generate(projectName, igusername, campaignId) {
  const inputPath = process.argv[2] || path.join(__dirname, `../contents/${projectName}.json`);
  const outputDir = process.argv[3] || path.join(__dirname, `../output/${igusername}/${projectName}`);
  const outputFile = process.argv[4] || path.join(__dirname, `../output/${igusername}/${projectName}.csv`);
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

    // Font selection strategy:
    // First 100 quotes (0-99) use 'Caacupe One'
    // Next 100 quotes (100-199) use 'Syne Mono'
    // (Note: use 'i % FONTS.length' instead if you want to switch font on every single post)
    const fontIndex = i % FONTS.length;
    const font = FONTS[fontIndex];


    const style = templateFor(i);
    const textFit = fitText(quote, CONTENT_WIDTH, CONTENT_HEIGHT);
    const svg = buildSvg({ quote, label, style, textFit, fontFamily: font.family });

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

    const imageUrl = `https://hashidosperb.github.io/imgdump/musicstory/output/${igusername}/${projectName}/${filename}`;
    const description = `${item.caption}\n${item.hashtags} - @${igusername} \n creator code: ${campaignId}`;
    const altText = item.alt_text || quote;

    manifest.push({
      description,
      image_url: imageUrl,
      alt_text: altText
    });

    if ((i + 1) % 100 === 0 || i === items.length - 1) {
      console.log(`Generated ${i + 1}/${items.length}`);
    }
  }

  const csvHeader = ['description', 'image_url', 'alt_text'];
  const csvRows = manifest.map((row) => [
    toCsvValue(row.description),
    toCsvValue(row.image_url),
    toCsvValue(row.alt_text)
  ].join(','));

  const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
  fs.writeFileSync(outputFile, `${csvContent}\n`);

  console.log(`Done. Created ${manifest.length} images.`);
  console.log(`CSV saved to: ${outputFile}`);
}
const projectName = "200_i_love_you_instagram_posts"

const igusername = "ilove.youuuuuuuuuuuu"
const campaignId = "ilu001"

generate(projectName, igusername, campaignId).catch((err) => {
  console.error('Generation failed:', err.message);
  process.exit(1);
});
