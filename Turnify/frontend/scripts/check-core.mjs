// Verifica que src/core no use nada exclusivo del navegador, para poder reusarlo en React Native.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = [
  [/from ['"]react-dom/, 'react-dom'],
  [/\bwindow\./, 'window'],
  [/\bdocument\./, 'document'],
  [/\blocalStorage\b|\bsessionStorage\b/, 'localStorage/sessionStorage'],
  [/\bFormData\b/, 'FormData'],
  [/import\.meta\.env/, 'import.meta.env (configurar con configureHttp)'],
  [/from ['"]@\/web/, 'importar desde web/'],
  [/<(div|span|section|button|input|form|label|p|h\d)\b/, 'etiquetas HTML'],
];

const files = (dir) =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

const problems = [];
for (const file of files('src/core')) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [pattern, what] of FORBIDDEN) if (pattern.test(line)) problems.push(`${file}:${i + 1}  usa ${what}`);
  });
}
if (problems.length) {
  console.error('src/core tiene que funcionar también en React Native:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('src/core OK: sin dependencias del navegador.');
