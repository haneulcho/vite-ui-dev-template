import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const appsRoot = path.join(repoRoot, 'apps');
const ZERO_SHA = '0000000000000000000000000000000000000000';

const apps = readdirSync(appsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .filter(entry => existsSync(path.join(appsRoot, entry.name, 'package.json')))
  .map(entry => {
    const pkgJsonPath = path.join(appsRoot, entry.name, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    return {
      dir: entry.name,
      name: pkg.name,
      path: `apps/${entry.name}`,
    };
  })
  .sort((a, b) => a.dir.localeCompare(b.dir));

const appsByDir = new Map(apps.map(app => [app.dir, app]));

const before = process.env.BEFORE || '';
const sha = process.env.SHA || 'HEAD';

function getChangedFiles(base, head) {
  try {
    const output = execSync(`git diff --name-only ${base} ${head}`, { encoding: 'utf8' }).trim();
    return output ? output.split(/\r?\n/) : [];
  } catch (error) {
    return [];
  }
}

let changedFiles = [];
if (!before || before === ZERO_SHA) {
  try {
    const output = execSync(`git ls-tree --full-tree -r --name-only ${sha}`, { encoding: 'utf8' }).trim();
    changedFiles = output ? output.split(/\r?\n/) : [];
  } catch (error) {
    changedFiles = [];
  }
} else {
  changedFiles = getChangedFiles(before, sha);
  if (changedFiles.length === 0) {
    try {
      const fallback = execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' }).trim();
      changedFiles = fallback ? fallback.split(/\r?\n/) : [];
    } catch (error) {
      changedFiles = [];
    }
  }
}

const globalTriggers = [
  'packages/',
  'pnpm-workspace.yaml',
  'package.json',
  'pnpm-lock.yaml',
  'scripts/',
];

let buildAll = changedFiles.some(file => globalTriggers.some(prefix => file.startsWith(prefix)));

const changedApps = new Set();
if (!buildAll) {
  for (const file of changedFiles) {
    if (!file.startsWith('apps/')) continue;
    const [, maybeApp] = file.split('/');
    if (maybeApp && appsByDir.has(maybeApp)) {
      changedApps.add(maybeApp);
    }
  }
}

const targetApps = buildAll
  ? apps
  : Array.from(changedApps)
      .map(dir => appsByDir.get(dir))
      .filter(Boolean);

const hasChanges = targetApps.length > 0;

const appsJson = JSON.stringify(
  targetApps.map(app => ({ path: app.path, name: app.name })),
  null,
  0
);

console.log(
  hasChanges ? `Changed apps: ${targetApps.map(app => app.dir).join(', ')}` : 'No apps require a build.'
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${hasChanges ? 'true' : 'false'}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `apps_json=${appsJson}\n`);
}
