import { defineConfig } from 'vite';

import includeHtml from 'vite-plugin-include-html';
import { fileURLToPath, URL } from 'url';

const serverUrl = `static/campaign/2025/chosen`;

// HTML 파일의 이미지 경로를 자동으로 변환하는 플러그인
function htmlImagePathTransform(mode) {
  return {
    name: 'html-image-path-transform',
    transformIndexHtml(html) {
      if (mode !== 'production') return html;

      return html.replace(/src="\/images\//g, `src="/${serverUrl}/images/`);
    },
  };
}

export default defineConfig(({ _command, mode }) => {
  return {
    plugins: [includeHtml(), htmlImagePathTransform(mode)],
    base: mode === 'production' ? `/${serverUrl}/` : '/',
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
      outDir: `dist/${serverUrl}`,
      // assetsDir: 'assets',
      sourcemap: true,
      // 빌드 최적화 설정
      rollupOptions: {
        output: {
          format: 'cjs',
          assetFileNames(assetInfo) {
            // assetInfo.name이 없을 경우 filename, source까지 체크
            const name =
              assetInfo?.name ||
              assetInfo?.filename ||
              (typeof assetInfo?.source === 'string' ? assetInfo.source : '');

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
            return 'js/app-[hash].js';
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
