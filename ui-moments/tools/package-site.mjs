import { execFileSync } from 'node:child_process';
import { cpSync, lstatSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, '_site');
const rootFiles = new Set(['index.html', 'styles.html', 'LICENSE', 'THIRD_PARTY_NOTICES.md', '.nojekyll']);
const tracked = execFileSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8'}).split('\0');
const siteFiles = tracked.filter(path => rootFiles.has(path) || (
  /^(assets|gallery)\//.test(path) &&
  !path.startsWith('gallery/date-picker/') &&
  !path.split('/').some(part => part.startsWith('.'))
));
const generated = [
  'gallery/loading-ui/dist',
  'gallery/svg-spinners/dist',
];

function copy(path) {
  const source = join(root, path);
  const destination = join(output, path);
  mkdirSync(dirname(destination), {recursive: true});
  cpSync(source, destination, {
    recursive: true,
    filter: file => {
      const entry = lstatSync(file);
      if (!entry.isFile() && !entry.isDirectory()) throw new Error(`发布文件不是普通文件或目录：${file}`);
      return true;
    },
  });
}

rmSync(output, {recursive: true, force: true});
for (const path of [...siteFiles, ...generated]) copy(path);
console.log('已准备 GitHub Pages 站点：_site/');
