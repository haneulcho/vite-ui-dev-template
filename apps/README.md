# 캠페인 앱 개발 가이드

`apps/` 디렉터리는 각 캠페인 페이지를 위한 Vite 기반 프론트엔드 앱을 담고 있습니다. pnpm 워크스페이스와 Turborepo로 묶여 있어 공통 설정 패키지(`packages/*`)와 캐시를 공유합니다.

## 요구 사항
- Node.js: 저장소 루트의 `.nvmrc` 버전 권장
- pnpm: 10.x 이상 (Corepack 활성화 권장)

## 설치
모든 앱은 루트에서 한 번만 설치하면 됩니다.
```bash
pnpm install
```

## 자주 쓰는 명령
Turborepo를 활용하는 루트 스크립트를 우선 사용하세요. 단일 앱만 실행하고 싶다면 `--filter`를 지정합니다.

| 목적 | 명령 |
| --- | --- |
| 개발 서버 | `pnpm turbo run dev --filter=@repo/2025-chosen` |
| 프로덕션 빌드 | `pnpm turbo run build --filter=@repo/2025-chosen` |
| ESLint 검사 | `pnpm --filter @repo/2025-chosen lint` |
| ESLint 자동 수정 | `pnpm --filter @repo/2025-chosen lint:fix` |
| Prettier 검사 | `pnpm --filter @repo/2025-chosen format` |
| Prettier 자동 정리 | `pnpm --filter @repo/2025-chosen format:fix` |
| 빌드 산출물 미리보기 | `pnpm --filter @repo/2025-chosen preview` |

> 루트 스크립트 대신 개별 앱 디렉터리에서 `pnpm dev`처럼 실행해도 되지만, Turborepo 캐시와 의존성 그래프를 활용하려면 `--filter` 방식이 안전합니다.

## 공통 설정 패키지
모든 앱은 다음 패키지를 통해 일관된 규칙을 공유합니다.
- `@repo/config-eslint`: ESM 기반 ESLint 설정
- `@repo/config-prettier`: Prettier 기본 설정
- `@repo/styles`: SASS 유틸리티(리셋, 변수, 믹스인 등)

필요 시 `package.json`에 `workspace:*` 버전으로 추가하여 사용하세요.

## 앱 디렉터리 구성 예시
```
apps/
└── 2025-chosen/
    ├── public/            # 정적 자산 (빌드 시 그대로 복사)
    ├── src/               # HTML include, JS, SCSS, 이미지 등
    ├── vite.config.js     # 캠페인별 Vite 설정
    └── package.json       # 앱 전용 스크립트와 의존성
```

### 빌드 산출물
- 기본 출력 경로: `dist/static/campaign/<year>/<slug>/`
- 프로덕션 모드에서는 `base` 옵션이 자동으로 `/<prefix>/`로 설정되고, HTML/CSS 자산 경로에 같은 접두사가 적용됩니다.
- JS/CSS/이미지는 해시 기반 파일명으로 출력되어 캐시 무효화가 용이합니다.

## 새 캠페인 앱 추가 절차
1. `apps/2025-chosen`을 참고해 새 디렉터리를 생성합니다. (예: `apps/2025-new`)
2. `package.json`의 `name`을 `@repo/<app-name>` 패턴으로 설정하고 필요한 의존성을 `workspace:*`로 연결합니다.
3. `vite.config.js`의 `appPath`와 `base` 설정을 새 캠페인 경로에 맞게 수정합니다.
4. CI나 Turbo 파이프라인에 추가 설정이 필요하다면 `turbo.json` 등을 확인합니다.
5. 루트에서 `pnpm install` 또는 `pnpm install --filter @repo/<app-name>`로 의존성을 동기화합니다.
6. `pnpm turbo run dev --filter=@repo/<app-name>`으로 개발 서버를 확인합니다.

### 디렉터리 안내
- `src/` 소스 코드 (HTML include, JS, SCSS)
- `public/` 정적 자산 (빌드 시 그대로 복사)
- `dist/` 빌드 산출물

### 소스 구조 상세 및 작성 가이드

#### JS: `src/js/main.js`
- 역할: 엔트리 스크립트. SCSS를 import하여 번들링하고, 페이지 초기화 코드를 실행합니다.
- 현재 내용 요약:
  - `import '../css/style.scss'`로 스타일을 포함
  - `DOMContentLoaded` 시점 로그 출력 등 기본 스캐폴드 포함
- 확장 방법:
  - 필요한 모듈을 추가로 import하여 사용합니다.
  - DOM 조작은 `DOMContentLoaded` 이벤트 안에서 수행하는 것을 권장합니다.

#### 스타일: `src/css/style.scss`
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

### 빌드/배포 동작 상세
- 출력 경로: `vite.config.js` 설정에 따라 `dist/static/campaign/2025/chosen`에 산출물 생성
- 파일명 규칙:
  - JS: `js/app-[hash].js`
  - CSS: `css/style-[hash].css` (엔트리명이 `index`인 경우 `style-`로 리네이밍)
  - 이미지: `images/[name]-[hash][ext]`
  - 폰트: `fonts/[name]-[hash][ext]`
- 프로덕션 경로(Base):
  - `base`가 프로덕션 모드에서 `'/static/campaign/2025/chosen/'`로 설정됩니다.
  - HTML 내 이미지 경로 `src="/images/..."`는 빌드 시 `src="/static/campaign/2025/chosen/images/..."`로 자동 치환됩니다.

### 빠른 체크리스트
1) `src/includes/*.html`을 생성/수정하고 `<include src="...">`로 `index.html`에 삽입했는가?
2) `src/css/style.scss`에서 필요한 부분 SCSS를 import했는가?
3) 동작 스크립트를 `src/js/main.js`에 추가했는가?
4) 개발 서버에서 확인 후 `pnpm build`로 산출물을 생성했는가?
