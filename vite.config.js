import { defineConfig } from 'vite';

import includeHtml from 'vite-plugin-include-html';
import { fileURLToPath, URL } from 'url';

const appPath = `static/campaign/2025/chosen`;

function getVersionDate() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

// 빌드된 index.html 내 js/css 경로에 ?ver=YYMMDD 쿼리를 추가하는 플러그인
function appendVer(html, prefix) {
  const version = getVersionDate();

  const resolvedPrefix = !prefix.startsWith('/') ? '/' + prefix : prefix;
  const escaped = resolvedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(href|src)=(["'])(${escaped}[^"'?#]+\\.(?:css|js))(\\2)`, 'g');

  return html.replace(regex, (_m, attr, quote, url) => {
    // 이미 query/hash 있으면 패스
    if (/[?#]/.test(url)) return `${attr}=${quote}${url}${quote}`;
    return `${attr}=${quote}${url}?ver=${version}${quote}`;
  });
}

// HTML 파일의 이미지 경로를 자동으로 변환하는 플러그인
function replaceImagePath(html, prefix) {
  return html.replace(/src="\/images\//g, `src="/${prefix}/images/`);
}

function htmlTransform(mode) {
  return {
    name: 'html-image-path-transform',
    transformIndexHtml(html) {
      if (mode !== 'production') return html;

      return appendVer(replaceImagePath(html, appPath), appPath);
    },
  };
}

function cssUrlPrefixer(prefix) {
  // data:, http(s):, / 로 시작하는 절대경로는 제외하고,
  // css에서 자주 쓰는 ../images/ 또는 images/ 패턴만 잡아 prefix를 붙입니다.
  const re = /url\((['"]?)(?!data:|https?:|\/)(?:\.\.\/)*images\/([^'")?#]+(?:[?#][^'")]+)?)\1\)/g;

  const normalized = prefix.replace(/^\/+|\/+$/g, ''); // 앞뒤 슬래시 정리

  return {
    name: 'css-url-prefixer',
    generateBundle(_opts, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          chunk.source = String(chunk.source).replace(
            re,
            (_m, quote, rest) => `url(${quote}/${normalized}/images/${rest}${quote})`
          );
        }
      }
    },
  };
}

export default defineConfig(({ _command, mode }) => {
  return {
    plugins: [includeHtml(), htmlTransform(mode), cssUrlPrefixer(appPath)],
    base: mode === 'production' ? `/${appPath}/` : '/',
    css: {
      preprocessorOptions: {
        scss: {
          outputStyle: 'expanded',
          indentType: 'tab',
          indentWidth: 1,
        },
      },
    },
    server: {
      port: 8081,
      open: true,
      cors: true,
    },
    build: {
      target: 'es2015',
      minify: 'terser',
      emptyOutDir: true,
      outDir: `dist/${appPath}`,
      // assetsDir: 'assets',
      sourcemap: true,
      // 빌드 최적화 설정
      rollupOptions: {
        output: {
          format: 'cjs',
          assetFileNames(assetInfo) {
            // assetInfo.name이 없을 경우 filename, source까지 체크
            const name =
              assetInfo?.name || assetInfo?.filename || (typeof assetInfo?.source === 'string' ? assetInfo.source : '');

            let extType = '';
            if (name) {
              const extMatch = name.match(/\.([a-zA-Z0-9]+)$/);
              const ext = extMatch ? extMatch[1].toLowerCase() : '';

              if (/png|jpe?g|svg|gif|tiff|webp|bmp|ico/i.test(ext)) {
                extType = 'images';
              } else if (/webm|mp3|mp4/i.test(ext)) {
                extType = 'media';
              } else if (/css/i.test(ext)) {
                extType = 'css';
              } else if (/woff2?|eot|ttf|otf/i.test(ext)) {
                extType = 'fonts';
              } else {
                extType = ext || 'assets';
              }
              // css 파일명이 index로 나오는 것을 style로 변경
              if (extType === 'css' && name.startsWith('index.')) {
                return `${extType}/style-[hash][extname]`;
              }
              return `${extType}/[name]-[hash][extname]`;
            }
            return `[name]-[hash][extname]`;
          },
          chunkFileNames(_chunkInfo) {
            return 'js/[name]-[hash].js';
          },
          entryFileNames(_chunkInfo) {
            return 'js/script-[hash].js';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@images': fileURLToPath(new URL('./src/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      },
    },
  };
});
