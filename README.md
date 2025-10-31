# vite-ui-dev-template

Vite와 pnpm 워크스페이스를 기반으로 랜딩/캠페인 UI를 빠르게 제작하기 위한 템플릿입니다. `apps/` 폴더에는 템플릿을 활용한 개별 프로젝트가, `packages/` 폴더에는 공통으로 사용하는 스타일 및 설정 패키지가 위치합니다.

## 요구 사항
- Node.js (권장 버전은 `.nvmrc` 참고)
- pnpm 10.x 이상 (Corepack 사용 가능)

## 디렉터리 구조
```
.
├── apps/
│   └── 2025-chosen/           # 기본으로 제공되는 샘플 앱 (Vite 기반)
│       ├── public/            # 정적 자산
│       ├── src/               # html includes, js, scss 등 앱 소스
│       └── package.json       # 앱 전용 의존성 및 스크립트
├── packages/
│   ├── config-eslint/         # 공통 ESLint 구성 (`@repo/config-eslint`)
│   ├── config-prettier/       # 공통 Prettier 구성 (`@repo/config-prettier`)
│   └── styles/                # 공통 SASS 유틸 (`@repo/styles`)
├── scripts/                   # CI/CD용 유틸 스크립트
├── package.json               # 루트 스크립트 (dev/build/lint 등)
├── pnpm-workspace.yaml        # 워크스페이스 정의
└── pnpm-lock.yaml
```

## 설치
```bash
pnpm install
```
> 루트에서 실행하면 워크스페이스에 포함된 모든 패키지의 의존성이 한 번에 설치됩니다.

## 루트 스크립트
루트 `package.json`은 앱들을 대상으로 하는 헬퍼 스크립트를 제공합니다.

| 스크립트 | 설명 |
| --- | --- |
| `pnpm dev` | Turbo를 통해 기본 샘플 앱(`@repo/2025-chosen`) 및 의존 패키지 개발 서버 실행 |
| `pnpm build` | Turbo 캐시를 활용해 `apps/` 하위 앱과 의존 패키지를 빌드 |
| `pnpm lint` / `lint:fix` | 모든 앱과 의존 패키지의 ESLint 검사 / 자동 수정 |
| `pnpm format` / `format:fix` | 모든 앱과 의존 패키지의 Prettier 포맷 검사 / 자동 정리 |

특정 앱만 실행하거나 빌드하려면 `--filter`를 사용하세요.
```bash
# 샘플 앱(2025-chosen) 개발 서버 (의존 패키지 포함)
pnpm turbo run dev --filter=@repo/2025-chosen^...

# 샘플 앱(2025-chosen)만 빌드 (의존 패키지 포함)
pnpm turbo run build --filter=@repo/2025-chosen^...
```

## 공통 패키지 사용법
- `@repo/styles`: 공통 SASS 유틸 모음 (`reset`, `variables`, `mixins` 등). 앱에서 예시처럼 사용합니다.
  ```scss
  @import '@repo/styles/reset';
  @import '@repo/styles/abstracts/variables';
  ```
- `@repo/config-eslint`: 모든 앱에서 동일한 린트 규칙을 적용합니다.
  ```js
  // apps/<app>/eslint.config.js
  import config from '@repo/config-eslint';
  export default config;
  ```
- `@repo/config-prettier`: 공통 포맷 설정을 `prettier.config.js`에서 불러옵니다.

새로운 공통 리소스를 추가하고 싶다면 `packages/` 하위에 패키지를 만들고 각 앱의 `package.json`에 `workspace:*` 버전으로 연결하면 됩니다.

## Turbo 파이프라인
- `turbo.json`에 정의된 파이프라인은 `build → lint → format` 등의 작업을 캐싱합니다.
- `dev` 작업은 캐시가 비활성화되어 있어 실시간 개발에 적합합니다.
- GitHub Actions에서 `.turbo` 디렉터리를 캐시하여 재빌드 시간을 단축합니다.

## GitHub Actions (Selective Build)
`.github/workflows/deploy.yml`은 변경된 앱만 빌드하도록 동작합니다.
- `scripts/find-changed-apps.mjs`가 변경 파일을 분석하여 필요한 앱만 선택합니다.
- 공통 패키지(`packages/**`)나 루트 설정이 수정되면 모든 앱을 다시 빌드합니다.
- Turbo로 빌드한 결과는 루트 `dist/`에 합쳐져 GitHub Pages에 배포됩니다.

## 새 앱 추가 가이드
1. `apps/<새로운-이벤트>` 폴더를 생성하고 Vite 프로젝트를 구성합니다.
2. `package.json`에서 공통 패키지를 `workspace:*` 버전으로 의존성에 추가합니다.
3. `pnpm install` 실행 후 `pnpm turbo run dev --filter=@repo/<새로운-이벤트>^...` 로 개발 서버를 확인합니다.
4. GitHub에 푸시하면 워크플로가 자동으로 변경분을 감지하여 해당 앱만 빌드합니다.

## 참고
- 기존 산출물 구조 및 빌드 옵션은 `apps/<이벤트>/vite.config.js`에서 확인할 수 있습니다.
- 스타일 설정은 `packages/styles` 패키지를 통해 공유되며, 각 앱은 필요 시 자유롭게 추가 스타일을 정의할 수 있습니다.
