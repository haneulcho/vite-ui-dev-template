import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const appsJsonRaw = process.env.APPS_JSON;
if (!appsJsonRaw) {
  console.log('No apps specified for build.');
  process.exit(0);
}

const apps = JSON.parse(appsJsonRaw);
if (!Array.isArray(apps) || apps.length === 0) {
  console.log('No apps to build.');
  process.exit(0);
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const turboFilters = apps
  .map(app => app?.name)
  .filter(Boolean)
  .map(name => `--filter=${name}^...`);

if (turboFilters.length === 0) {
  console.log('No valid app filters found.');
  process.exit(0);
}

console.log(`Running turbo build with filters: ${turboFilters.join(' ')}`);
execFileSync('pnpm', ['turbo', 'run', 'build', ...turboFilters], { stdio: 'inherit' });

for (const app of apps) {
  const appPath = app.path;
  const distDir = path.join(appPath, 'dist');
  if (!existsSync(distDir)) {
    console.warn(`Skipping copy for ${appPath}, dist directory not found.`);
    continue;
  }

  for (const entry of readdirSync(distDir)) {
    const source = path.join(distDir, entry);
    const destination = path.join('dist', entry);
    cpSync(source, destination, { recursive: true, force: true });
  }
}
