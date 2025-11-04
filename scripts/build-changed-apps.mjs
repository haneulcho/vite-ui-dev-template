import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// GitHub Actions step에서 전달한 대상 앱 목록을 읽는다.
const appsJsonRaw = process.env.APPS_JSON;
if (!appsJsonRaw) {
  console.log('No apps specified for build.');
  process.exit(0);
}

// JSON 문자열을 실제 앱 정보 배열로 역직렬화한다.
const apps = JSON.parse(appsJsonRaw);
if (!Array.isArray(apps) || apps.length === 0) {
  console.log('No apps to build.');
  process.exit(0);
}

// 루트 dist가 없다면 생성한다.
mkdirSync('dist', { recursive: true });

// 변경된 앱 목록을 순회하면서 개별 빌드/복사 작업을 수행한다.
for (const app of apps) {
  const appPath = app.path;
  const appDir = app.dir || path.basename(appPath);
  const distDir = path.join(appPath, 'dist');
  const repoDistDir = path.join('dist', appDir);

  // 각 앱은 monorepo 모드로 개별 빌드를 실행해 루트 dist에 결과물을 만든다.
  rmSync(repoDistDir, { recursive: true, force: true });
  console.log(`Building ${app.name} with mode "monorepo"`);
  execFileSync('pnpm', ['--filter', app.name, 'run', 'build', '--mode', 'monorepo'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (existsSync(repoDistDir)) {
    // Vite가 저장소 루트 dist/<앱> 경로로 바로 출력했다면 추가 복사가 필요 없다.
    continue;
  }

  // 빌드 후 앱 내부 dist가 없다면 복사를 건너뛰고 경고 로그를 남긴다.
  if (!existsSync(distDir)) {
    console.warn(`Skipping copy for ${appPath}, dist directory not found.`);
    continue;
  }

  // 앱 빌드 산출물 내부 구조를 확인하고 복사 대상 경로를 결정한다.
  const distDirEntries = readdirSync(distDir);
  const expectedSource = path.join(distDir, appDir);
  const sourceRoot = existsSync(expectedSource) ? expectedSource : distDir;

  mkdirSync(path.dirname(repoDistDir), { recursive: true });
  cpSync(sourceRoot, repoDistDir, { recursive: true, force: true });

  // 예상 디렉토리가 없으면 전체 dist 내용을 복사했음을 로그로 남긴다.
  if (!existsSync(expectedSource) && distDirEntries.length !== 0) {
    console.warn(
      `Copied all contents of ${distDir} because ${expectedSource} was not found.`
    );
  }
}
