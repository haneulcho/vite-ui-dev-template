#!/usr/bin/env node
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const appsRoot = path.join(repoRoot, 'apps');
const distRoot = path.join(repoRoot, 'dist');

if (!existsSync(distRoot)) {
  console.log('dist directory does not exist, skipping cleanup.');
  process.exit(0);
}

function getDirectories(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

const appDirs = new Set(
  getDirectories(appsRoot).filter(dir =>
    existsSync(path.join(appsRoot, dir, 'package.json'))
  )
);

const distDirs = getDirectories(distRoot);
const staleDirs = distDirs.filter(dir => !appDirs.has(dir)).sort((a, b) => a.localeCompare(b));

if (!staleDirs.length) {
  console.log('No stale apps found in dist.');
  process.exit(0);
}

staleDirs.forEach(dir => {
  const target = path.join(distRoot, dir);
  rmSync(target, { recursive: true, force: true });
  console.log(`Removed ${target}`);
});
