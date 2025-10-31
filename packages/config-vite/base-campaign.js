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

export function defineCampaignConfig({
  appPath,
  projectRoot = process.cwd(),
  alias = {},
  server = {},
  build = {},
  css = {},
  plugins = [],
} = {}) {
  if (!appPath) {
    throw new Error('defineCampaignConfig: "appPath" 옵션은 필수입니다.');
  }

  const normalizedAppPath = normalizeAppPath(appPath);

  return defineConfig(({ mode }) => {
    const resolvedServer = {
      port: 8081,
      open: true,
      cors: true,
      ...server,
    };

    const resolvedBuild = createBuildOptions(normalizedAppPath, build);
    const resolvedCss = resolveCssOptions(css);
    const resolvedAlias = {
      ...createDefaultAliases(projectRoot),
      ...alias,
    };

    const productionBase = normalizedAppPath ? `/${normalizedAppPath}/` : '/';

    return {
      plugins: [
        includeHtml(),
        createCampaignHtmlTransform(mode, normalizedAppPath),
        createCampaignCssUrlPrefixer(normalizedAppPath),
        ...plugins,
      ],
      base: mode === 'production' ? productionBase : '/',
      css: resolvedCss,
      server: resolvedServer,
      build: resolvedBuild,
      resolve: {
        alias: resolvedAlias,
      },
    };
  });
}
