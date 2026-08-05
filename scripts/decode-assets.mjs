// Dekoder *.b64-filer i public/ til ekte binærfiler (f.eks. kartbilder).
// Kjøres automatisk før dev/build, slik at binærfiler kan ligge som
// tekst i repoet.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../public', import.meta.url).pathname;
for (const name of readdirSync(dir)) {
  if (!name.endsWith('.b64')) continue;
  const target = join(dir, name.slice(0, -4));
  const data = Buffer.from(readFileSync(join(dir, name), 'utf8'), 'base64');
  writeFileSync(target, data);
  console.log(`decode-assets: ${name} → ${name.slice(0, -4)} (${data.length} bytes)`);
}
