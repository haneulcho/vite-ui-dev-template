## Vite + SASS + HTML UI 개발 기본 템플릿

Vite 기반 정적 웹 프로젝트입니다. 개발/빌드/미리보기 및 코드 품질 관리를 위해 pnpm 스크립트를 제공합니다.

### 요구 사항
- Node.js (권장: `.nvmrc` 참조)
- pnpm 9.x 이상

### 설치
```bash
pnpm install
```

### 사용법 (Scripts)
- **개발 서버 실행**: HMR이 가능한 로컬 서버를 실행합니다.
```bash
pnpm dev
```

- **프로덕션 빌드**: 최적화된 정적 파일을 `dist/`에 생성합니다.
```bash
pnpm build
```

- **빌드 미리보기**: 빌드된 결과물을 로컬에서 서빙합니다.
```bash
pnpm preview
```

- **ESLint 검사**: `src/`의 `.js` 파일을 검사하고 사용되지 않는 eslint-disable 지시어를 보고합니다.
```bash
pnpm lint
```

- **ESLint 자동 수정**: 가능한 규칙을 자동으로 수정합니다.
```bash
pnpm lint:fix
```

- **Prettier 포맷 검사**: `src/**/*.{js,html}` 포맷을 확인합니다.
```bash
pnpm format
```

- **Prettier 자동 정리**: 지정된 경로의 코드를 포맷팅합니다.
```bash
pnpm format:fix
```

### 빌드 결과
- 산출물 경로: `dist/`
- 배포 정적 자산: `dist/static/campaign/2025/chosen/` (프로젝트 구조에 따라 달라질 수 있음)

### 기술 스택
- Vite, PostCSS(autoprefixer), Sass
- ESLint, Prettier

### 디렉터리 안내
- `src/` 소스 코드 (HTML include, JS, SCSS)
- `public/` 정적 자산 (빌드 시 그대로 복사)
- `dist/` 빌드 산출물

### 참고
- 저장소/홈페이지/버그 리포트 URL은 `package.json`의 `repository`, `homepage`, `bugs` 필드를 참조하세요.

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
