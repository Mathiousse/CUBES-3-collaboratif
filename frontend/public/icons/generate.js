const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

sizes.forEach(({ name, size, maskable }) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = maskable ? '#2d1a0e' : '#faf8f5';
  ctx.fillRect(0, 0, size, size);

  ctx.font = `${Math.floor(size * 0.65)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍔', size / 2, size / 2 + size * 0.05);

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, name), buf);
  console.log(`Created ${name}`);
});
