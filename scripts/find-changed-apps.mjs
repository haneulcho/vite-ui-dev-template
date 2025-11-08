import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// GitHub가 브랜치를 생성할 때 before SHA가 0으로 전달되는 경우를 대비한다.
const ZERO_SHA = '0000000000000000000000000000000000000000';

const repoRoot = process.cwd();
const appsRoot = path.join(repoRoot, 'apps');

// apps 폴더 내 디렉토리를 순회하면서 package.json이 있는 프로젝트만 골라낸다.
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

// dir 이름으로 빠르게 앱 정보를 찾을 수 있게 Map을 만든다.
const appsByDir = new Map(apps.map(app => [app.dir, app]));

// GitHub Actions에서 전달한 base(before)와 head(sha)를 읽는다.
const before = process.env.BEFORE || '';
const sha = process.env.SHA || 'HEAD';

// git diff를 실행해 두 커밋 간 변경 파일 목록을 구한다.
function getChangedFiles(base, head) {
  try {
    const output = execSync(`git diff --name-only ${base} ${head}`, { encoding: 'utf8' }).trim();
    return output ? output.split(/\r?\n/) : [];
  } catch (error) {
    // diff가 실패하면 빈 배열을 반환해 후속 로직에서 fallback을 시도한다.
    return [];
  }
}

let changedFiles = [];
if (!before || before === ZERO_SHA) {
  // 워크플로 첫 실행 등으로 before가 없을 때는 전체 파일 목록으로 대체한다.
  try {
    const output = execSync(`git ls-tree --full-tree -r --name-only ${sha}`, { encoding: 'utf8' }).trim();
    changedFiles = output ? output.split(/\r?\n/) : [];
  } catch (error) {
    changedFiles = [];
  }
} else {
  // 일반적인 경우에는 before~sha 범위 diff 결과를 사용한다.
  changedFiles = getChangedFiles(before, sha);
  if (changedFiles.length === 0) {
    // diff 결과가 비어 있으면 최근 커밋 비교로 한 번 더 시도한다.
    try {
      const fallback = execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' }).trim();
      changedFiles = fallback ? fallback.split(/\r?\n/) : [];
    } catch (error) {
      changedFiles = [];
    }
  }
}

// 공통 패키지나 스크립트가 변하면 모든 앱을 다시 빌드한다.
const globalTriggers = [
  'packages/',
  'pnpm-workspace.yaml',
  'package.json',
  'pnpm-lock.yaml',
  'scripts/',
];

// 전역 변경이 있을 경우 모든 앱을 빌드하도록 플래그를 세팅한다.
let buildAll = changedFiles.some(file => globalTriggers.some(prefix => file.startsWith(prefix)));

// 개별 앱 디렉토리에서 변경이 발생했는지 추적한다.
const changedApps = new Set();
const deletedApps = new Set();
if (!buildAll) {
  for (const file of changedFiles) {
    if (!file.startsWith('apps/')) continue;
    const [, app] = file.split('/');
    if (!app) continue;

    if (appsByDir.has(app)) {
      changedApps.add(app);
      continue;
    }

    const deletedAppPath = path.join(appsRoot, app);
    if (!existsSync(deletedAppPath)) {
      deletedApps.add(app);
    }
  }
}

// 전체 빌드가 필요하면 모든 앱을, 아니면 변경된 앱만 대상으로 삼는다.
const targetApps = buildAll
  ? apps
  : Array.from(changedApps)
      .map(dir => appsByDir.get(dir))
      .filter(Boolean);

// 실제 빌드 대상이 존재하거나 삭제된 앱이 있는지 여부를 기록한다.
const hasChanges = targetApps.length > 0 || deletedApps.size > 0;

// GitHub Actions step outputs 에 기록하기 위해 dir/path/name 정보를 JSON으로 구성한다.
const appsJson = JSON.stringify(
  targetApps.map(({ dir, path, name }) => ({ dir, path, name })),
  null,
  0
);

const deletedAppsJson = JSON.stringify(Array.from(deletedApps).sort());

if (!hasChanges) {
  console.log('No apps require a build.');
} else {
  const updated = targetApps.length ? `Changed apps: ${targetApps.map(app => app.dir).join(', ')}` : '';
  const removed = deletedApps.size ? `Deleted apps: ${Array.from(deletedApps).sort().join(', ')}` : '';
  console.log([updated, removed].filter(Boolean).join(' | '));
}

// GitHub Actions 환경에서는 GITHUB_OUTPUT에 결과를 써서 이후 step에서 참조 가능하도록 한다.
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${hasChanges ? 'true' : 'false'}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `apps_json=${appsJson}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `deleted_apps_json=${deletedAppsJson}\n`);
}
