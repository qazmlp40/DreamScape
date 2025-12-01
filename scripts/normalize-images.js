const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../assets/images');
const TARGET_SIZE = 256; // 큰 기본 사이즈 (React Native가 48×48로 축소)

// 감정 아이콘 파일명
const moodIcons = [
  'happy_icon.png',
  'Sad_icon.png',
  'anger_icon.png',
  'Excitement_icon.png',
  'Impressed_icon.png',
  'Proclamation_icon.png',
  'Ambiguous_icon.png'
];

async function normalizeImages() {
  console.log(`🖼️  이미지 정규화 시작 (${TARGET_SIZE}×${TARGET_SIZE})...\n`);

  for (const filename of moodIcons) {
    const inputPath = path.join(imagesDir, filename);
    const outputPath = inputPath; // 덮어쓰기

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${filename} 파일 없음`);
      continue;
    }

    try {
      const tempPath = path.join(imagesDir, `temp_${filename}`);
      
      // 이미지를 정사각형으로 정규화 (배경색 흰색)
      await sharp(inputPath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(tempPath);

      // 임시 파일을 원본으로 교체
      fs.renameSync(tempPath, outputPath);

      console.log(`✅ ${filename}`);
    } catch (err) {
      console.error(`❌ ${filename}: ${err.message}`);
    }
  }

  console.log(`\n✨ 정규화 완료!`);
}

normalizeImages();
