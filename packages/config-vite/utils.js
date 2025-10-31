import path from 'node:path';

export function getVersionDate() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export function normalizeAppPath(appPath = '') {
  return String(appPath).replace(/^\/+|\/+$/g, '');
}

export function createDefaultAliases(projectRoot) {
  return {
    '@': path.resolve(projectRoot, 'src'),
    '@images': path.resolve(projectRoot, 'src/images'),
    '@styles': path.resolve(projectRoot, 'src/styles'),
  };
}

export function defaultAssetFileNames(assetInfo) {
  const name =
    assetInfo?.name || assetInfo?.filename || (typeof assetInfo?.source === 'string' ? assetInfo.source : '');

  if (!name) return '[name]-[hash][extname]';

  const extMatch = name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  let extType = '';
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

  if (extType === 'css' && name.startsWith('index.')) {
    return `${extType}/style-[hash][extname]`;
  }

  return `${extType}/[name]-[hash][extname]`;
}
