import { getVersionDate } from './utils.js';

// 빌드된 index.html 내 js/css 경로에 ?ver=YYMMDD 쿼리를 추가하는 플러그인
export function appendVersionQuery(html, appPath) {
  const version = getVersionDate();

  const escapedPrefix = `/${appPath}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const assetPattern = new RegExp(
    `(href|src)=([\"'])(${escapedPrefix}[^\"'?#]+\\.(?:css|js))(\\2)`,
    'g'
  );

  return html.replace(assetPattern, (_match, attr, quote, url) => {
    // 이미 query/hash 있으면 패스
    if (/[?#]/.test(url)) return `${attr}=${quote}${url}${quote}`;

    return `${attr}=${quote}${url}?ver=${version}${quote}`;
  });
}

// HTML 파일의 이미지 경로를 자동으로 변환하는 플러그인
export function injectCampaignImagePath(html, prefix) {
  return html.replace(/src="\/images\//g, `src="/${prefix}/images/`);
}

export function createCampaignHtmlTransform(mode, appPath) {
  return {
    name: 'campaign-html-transform',
    transformIndexHtml(html) {
      if (mode !== 'production') return html;

      const withImages = injectCampaignImagePath(html, appPath);

      return appendVersionQuery(withImages, appPath);
    },
  };
}

// data:, http(s):, / 로 시작하는 절대경로는 제외하고,
// css에서 자주 쓰는 ../images/ 또는 images/ 패턴만 잡아 prefix 붙이는 플러그인
export function createCampaignCssUrlPrefixer(appPath) {
  return {
    name: 'campaign-css-url-prefixer',
    generateBundle(_options, bundle) {
      if (!appPath) return;

      const CSS_IMAGE_URL_PATTERN = /url\((['\"]?)(?!data:|https?:|\/)(?:\.\.\/)*images\/([^'\")?#]+(?:[?#][^'\")]+)?)\1\)/g;
      const cssMatcher = new RegExp(CSS_IMAGE_URL_PATTERN.source, CSS_IMAGE_URL_PATTERN.flags);

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!fileName.endsWith('.css') || chunk.type !== 'asset') continue;

        cssMatcher.lastIndex = 0;
        chunk.source = String(chunk.source).replace(
          cssMatcher,
          (_match, quote = '', rest) => `url(${quote}/${appPath}/images/${rest}${quote})`
        );
      }
    },
  };
}
