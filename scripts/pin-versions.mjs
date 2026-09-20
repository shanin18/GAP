// Replaces every "latest" in package.json with the version that is installed right now.
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let changed = 0;

for (const section of ['dependencies', 'devDependencies']) {
  for (const [name, range] of Object.entries(pkg[section] ?? {})) {
    if (range !== 'latest') continue;
    const file = `node_modules/${name}/package.json`;
    if (!fs.existsSync(file)) {
      console.warn(`skipped ${name}: not installed`);
      continue;
    }
    pkg[section][name] = JSON.parse(fs.readFileSync(file, 'utf8')).version;
    changed += 1;
    console.log(`${name} -> ${pkg[section][name]}`);
  }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`\nPinned ${changed} packages.`);
