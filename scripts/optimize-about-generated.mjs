import sharp from 'sharp';
const source = '.image-work/about-generated.png';
const image = sharp(source);
const metadata = await image.metadata();
if (!metadata.hasAlpha) throw new Error('Hero cutout requires transparency');
const output = await image.resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 95, effort: 6 }).toFile('public/images/about-student-generated.webp');
console.log(JSON.stringify({ bytes: output.size, width: output.width, height: output.height }));
