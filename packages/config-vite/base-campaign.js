import path from 'node:path';
import { defineConfig } from 'vite';
import includeHtml from 'vite-plugin-include-html';

import {
  normalizeAppPath,
  createDefaultAliases,
  defaultAssetFileNames,
} from './utils.js';
import {
  createCampaignHtmlTransform,
  createCampaignCssUrlPrefixer,
} from './plugins.js';

function resolveCssOptions(overrides = {}) {
  const base = {
    preprocessorOptions: {
      scss: {
        outputStyle: 'expanded',
        indentType: 'tab',
        indentWidth: 1,
      },
    },
  };

  return {
    ...base,
    ...overrides,
    preprocessorOptions: {
      ...base.preprocessorOptions,
      ...overrides.preprocessorOptions,
      scss: {
        ...base.preprocessorOptions.scss,
        ...(overrides.preprocessorOptions?.scss ?? {}),
      },
    },
  };
}

function createBuildOptions(appPath, overrides = {}) {
  // appPath 존재 여부에 따라 기본 outDir 계산
  const baseOutDir = appPath ? `dist/${appPath}` : 'dist';

  const base = {
    target: 'es2015',
    minify: 'terser',
    emptyOutDir: true,
    outDir: baseOutDir,
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'cjs',
        assetFileNames: defaultAssetFileNames,
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/script-[hash].js',
      },
    },
  };

  const overrideRollup = overrides.rollupOptions ?? {};
  const overrideOutput = overrideRollup.output ?? {};

  return {
    ...base,
    ...overrides,
    rollupOptions: {
      ...base.rollupOptions,
      ...overrideRollup,
      output: {
        ...base.rollupOptions.output,
        ...overrideOutput,
      },
    },
  };
}

const DEFAULT_MONOREPO_MODES = ['monorepo'];

export function defineCampaignConfig({
  appPath,
  projectRoot = process.cwd(),
  alias = {},
  server = {},
  build = {},
  css = {},
  plugins = [],
  monorepo = {},
} = {}) {
  if (!appPath) {
    throw new Error('defineCampaignConfig: "appPath" 옵션은 필수입니다.');
  }

  // Vite base 설정에 사용될 기본 appPath를 정규화한다.
  const normalizedAppPath = normalizeAppPath(appPath);

  // 프로젝트 루트에서 현재 앱의 디렉토리명을 추출해 기본 하위 경로로 사용한다.
  const projectDirName = normalizeAppPath(path.basename(projectRoot));

  const monorepoOptions = monorepo ?? {};
  const repoNameFromEnv = normalizeAppPath(
    monorepoOptions.repositoryName ?? process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
  );

  // 하위 경로는 옵션, 환경 변수, 디렉토리명 순으로 결정
  const monorepoSubdirSource =
    monorepoOptions.subdir ?? process.env.GITHUB_PAGES_APP_DIR ?? projectDirName;
  const normalizedMonorepoSubdir = normalizeAppPath(monorepoSubdirSource);
  const rawMonorepoOutDir =
    monorepoOptions.outputSubdir ?? (normalizedMonorepoSubdir || normalizedAppPath);
  const normalizedMonorepoOutDir = normalizeAppPath(rawMonorepoOutDir);
  const monorepoModes = Array.isArray(monorepoOptions.modes)
    ? monorepoOptions.modes.filter(Boolean)
    : monorepoOptions.modes
      ? [monorepoOptions.modes]
      : DEFAULT_MONOREPO_MODES;

  const repoRoot = path.resolve(projectRoot, '..', '..'); // apps/<name>/ 기준으로 상위 두 단계가 repo 루트
  // 모노레포 모드에서 산출물을 모을 루트 dist 경로
  const monorepoOutputRoot = monorepoOptions.outputRoot
    ? path.resolve(projectRoot, monorepoOptions.outputRoot)
    : path.join(repoRoot, 'dist');

  return defineConfig(({ mode, command }) => {
    const isMonorepoMode = monorepoModes.includes(mode);
    const monorepoBasePath = [repoNameFromEnv, normalizedMonorepoOutDir].filter(Boolean).join('/');
    const buildTargetPath = isMonorepoMode ? normalizedMonorepoOutDir : normalizedAppPath;
    const effectiveAppPath = isMonorepoMode ? monorepoBasePath : normalizedAppPath;
    const transformMode = isMonorepoMode ? 'production' : mode;

    const resolvedServer = {
      port: 8081,
      open: true,
      cors: true,
      ...server,
    };

    const resolvedBuild = createBuildOptions(buildTargetPath, build);
    if (isMonorepoMode) {
      resolvedBuild.outDir = path.join(monorepoOutputRoot, normalizedMonorepoOutDir);
    }
    const resolvedCss = resolveCssOptions(css);
    const resolvedAlias = {
      ...createDefaultAliases(projectRoot),
      ...alias,
    };

    const productionBase = effectiveAppPath ? `/${effectiveAppPath}/` : '/';
    const shouldApplyBase =
      command === 'build' && (mode === 'production' || mode === 'test' || isMonorepoMode);

    return {
      plugins: [
        includeHtml(),
        createCampaignHtmlTransform(transformMode, effectiveAppPath),
        createCampaignCssUrlPrefixer(effectiveAppPath),
        ...plugins,
      ],
      // 모노레포 모드에서는 `/repo/app/` 형태가 되도록 base를 설정한다.
      base: shouldApplyBase ? productionBase : '/',
      css: resolvedCss,
      server: resolvedServer,
      build: resolvedBuild,
      resolve: {
        alias: resolvedAlias,
      },
    };
  });
}
