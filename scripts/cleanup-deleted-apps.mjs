#!/usr/bin/env node
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const raw = process.env.DELETED_APPS || '[]';
let deletedDirs = [];

try {
  deletedDirs = JSON.parse(raw);
} catch (error) {
  console.warn('Failed to parse DELETED_APPS, skipping cleanup.');
  process.exit(0);
}

if (!Array.isArray(deletedDirs) || deletedDirs.length === 0) {
  console.log('No deleted apps to clean.');
  process.exit(0);
}

deletedDirs
  .map(String)
  .sort()
  .forEach(dir => {
    const target = path.join('dist', dir);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      console.log(`Removed ${target}`);
    } else {
      console.log(`Skip removal, ${target} not found.`);
    }
  });
