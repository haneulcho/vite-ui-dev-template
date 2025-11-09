# apps/ 프로젝트 개발 가이드

`apps/` 폴더는 각 프로모션/이벤트 페이지를 위한 독립적인 코드를 담고 있습니다. 모든 프로젝트는 PNPM Workspace에 포함되며 Turborepo를 통해 공통 스크립트, 캐시 전략, 배포 방식을 공유합니다.

## 설치
1. root에서 **한 번만** `pnpm install`을 실행하면 모든 프로젝트 의존성이 설치됩니다.
2. 프로젝트를 실행하거나 빌드할 때는 **되도록 root에서 `pnpm <task> --filter=@repo/<프로젝트명>` 패턴을 사용**해 주세요.
3. GitHub Pages 배포 구조를 재현하려면 각 프로젝트의 `build` 명령에 `-- --mode monorepo` 옵션을 넘기면 됩니다.

예시:
```bash
pnpm dev --filter=@repo/2025-homepage
pnpm build --filter=@repo/2025-homepage     # 프로젝트 폴더에 빌드
pnpm build --filter @repo/2025-homepage -- --mode monorepo   # root에 빌드
```

## Filter를 통한 개별 프로젝트 명령
**README.md 파일을 참고하여 root 경로에서 Turborepo를 활용하는 스크립트를 우선 사용하세요. 아래 방식은 권장하지 않습니다.**

| 목적 | 명령 |
| --- | --- |
| 개발 서버 | `pnpm dev` |
| 프로덕션 빌드 | `pnpm build` |
| ESLint 검사 | `pnpm lint` |
| ESLint 자동 수정 | `pnpm lint:fix` |
| Prettier 검사 | `pnpm format` |
| Prettier 자동 정리 | `pnpm format:fix` |
| 빌드 산출물 미리보기 | `pnpm preview` |

## 프로젝트 구성 예시
```
apps/
└── 2025-homepage/
    ├── public/            # 정적 자산 (빌드 시 그대로 복사)
    ├── src/               # HTML include, JS, SCSS, 이미지 등
    ├── vite.config.js     # Vite 설정
    └── package.json       # 프로젝트 전용 스크립트와 의존성
```

## Vite 설정 규칙 (`@repo/config-vite`)
각 프로젝트의 `vite.config.js`는 다음 패턴을 따릅니다.
```js
import { defineCampaignConfig } from '@repo/config-vite';

const appPath = 'static/campaign/<year>/<slug>';

export default defineCampaignConfig({
  appPath,
  // monorepo 옵션, 별칭, 서버 포트 등을 필요 시 추가 설정
});
```
- `appPath`는 산출물 기준 경로이자 base 경로의 핵심 값입니다.
- `monorepo` 모드(`pnpm build -- --mode monorepo`) 빌드는 GitHub Pages 저장소 이름(`vite-monorepo-ui-dev`)과 프로젝트 폴더를 조합한 `/<repo>/<프로젝트명>/` 형태로 base가 강제됩니다.
- 서버 기본 포트는 `8081`입니다. 프로젝트 단위로 변경하려면 `defineCampaignConfig({ server: { port: 8082 } })`처럼 옵션을 넘기세요.

## 빌드 산출물 규칙
- 기본 모드: `vite.config.js` 설정에 따라 `<프로젝트 폴더>/dist/<vite.config.js 파일에서 설정한 appPath>` 아래에 산출물이 생성됩니다.
- `--mode monorepo`: 저장소 root `<root>/dist/<프로젝트명>/...` 형태로 출력되어 GitHub Pages에 그대로 업로드합니다.
- 파일명 규칙
  - JS 엔트리: `js/script-[hash].js`
  - CSS 엔트리: `css/style-[hash].css`
  - 이미지/폰트: `images/[name]-[hash][ext]`, `fonts/[name]-[hash][ext]`
- `index.html`의 `<script>/<link>` 경로에는 빌드 날짜 기반 `?ver=YYMMDD`가 부여되어 캐시 무효화를 돕습니다.
- HTML 내 이미지 경로 `src="/images/..."`는 빌드 시 `src="/<vite.config.js 파일에서 설정한 appPath>/images/..."`로 자동 치환됩니다.

## 공통 설정 패키지
모든 프로젝트는 다음 패키지를 통해 일관된 규칙을 공유합니다.
- `@repo/config-eslint`: ESM 기반 ESLint 설정
- `@repo/config-prettier`: Prettier 기본 설정
- `@repo/styles`: SASS 유틸리티(reset css, 변수, SASS mixin 등)

----

## 소스 구조 상세 및 작성 가이드

#### Script: `src/js/main.js`
- 역할: 엔트리 스크립트. SCSS를 import하여 번들링하고, 페이지 초기화 코드를 실행합니다.
- 현재 내용 요약:
  - `import '../css/style.scss'`로 스타일을 포함
  - `DOMContentLoaded` 시점 로그 출력 등 기본 스캐폴드 포함
- 확장 방법:
  - 필요한 모듈을 추가로 import하여 사용합니다.
  - DOM 조작은 `DOMContentLoaded` 이벤트 안에서 수행하는 것을 권장합니다.

#### Style: `src/css/style.scss`
- 역할: 전역 스타일 및 컴포넌트 스타일의 진입점.
- Vite SCSS 설정: `vite.config.js`의 `css.preprocessorOptions.scss`로 아래와 같이 포맷이 고정됩니다.
  - `outputStyle: 'expanded'`, `indentType: 'tab'`, `indentWidth: 1`
- 사용 방법:
  - 부분 스타일을 `_component.scss`, `_media.scss` 등으로 분리하고 `style.scss`에서 import하세요.
  - `main.js`가 `style.scss`를 import하므로 별도 링크 태그는 필요 없습니다.

#### HTML 인클루드: `src/includes/`
- 위치: `src/includes/vendors.html`, `src/includes/contents.html` 등 조각(Partial) HTML 관리
- 개발/빌드 반영 방식:
  - `vite-plugin-include-html` 플러그인이 `<include src="...">` 태그를 해석하여 해당 파일 내용을 정적으로 삽입합니다.
  - 개발 서버(`pnpm dev`)와 빌드(`pnpm build`) 모두에서 동작합니다.
  - 예) `index.html` 내 삽입:
    ```html
    <!-- 추가 css js 입력 -->
    <include src="src/includes/vendors.html"></include>
    <!-- 컨텐츠 작업 영역 - html -->
    <include src="src/includes/contents.html"></include>
    ```
- 새 인클루드 파일 추가 절차:
  1) `src/includes/example.html` 파일 생성
  2) `index.html` 원하는 위치에 다음과 같이 삽입
     ```html
     <include src="src/includes/example.html"></include>
     ```
  3) 개발 서버가 자동 반영하며, 빌드 시에는 최종 HTML에 정적으로 병합됩니다.

#### `index.html`과 스크립트 주입
- 모듈 엔트리 연결: 페이지 하단에 다음처럼 연결되어 있습니다.
  ```html
  <script type="module" src="./src/js/main.js"></script>
  ```
- 프로젝트 내부 인클루드는 `<include src="...">`로 처리됩니다.

### 빠른 체크리스트
1) `src/includes/*.html`을 생성/수정하고 `<include src="...">`로 `index.html`에 삽입했는가?
2) `src/css/style.scss`에서 필요한 부분 SCSS를 import했는가?
3) 동작 스크립트를 `src/js/main.js`에 추가했는가?
4) 개발 서버에서 확인 후 `pnpm build`로 산출물을 생성했는가?
