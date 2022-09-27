import { gzipSize } from 'gzip-size';
import { readdir as rd, readFile as rf } from 'node:fs';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import uglify from 'uglify-js';

const root = join(dirname('../'), './dist/esm');

const readdir = promisify(rd);
const readfile = promisify(rf);

const files = await readdir(root);

const items = [];
let total = 0;

for (const file of files.filter((f) => f.endsWith('.js'))) {
  const filePath = join(root, file);
  const buffer = await readfile(filePath, 'utf-8');
  const { code } = uglify.minify(buffer, {
    compress: true,
    module: true,
  });
  const size = await gzipSize(code);
  total += size;

  console.log(`${file}: ${kb(size)} kb`);
}

console.log(`\r\nTotal: ${kb(total)} kb`);

function kb(value) {
  return Math.round(value * 0.1) / 100;
}
