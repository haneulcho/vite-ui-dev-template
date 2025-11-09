# vite-monorepo-ui-dev

클라이언트 렌더링을 활용하는 다수의 캠페인(이벤트, 프로모션)과 랜딩 UI를 한 저장소에서 개발·배포하기 위한 템플릿입니다. 각 프로젝트는 `apps/`에, 공통 설정과 유틸은 `packages/`에 두고 GitHub Pages로 배포합니다.

## 주요 특징
- `apps/` 아래에 독립적인 Vite 프로젝트(예: `202511-event`, `2025-homepage`)를 개발
- 공유 패키지: ESLint/Prettier/Vite 설정, SCSS 유틸, 접근 제어 위젯 등을 `@repo/*` 패키지로 배포, Workspace에서 활용
- 일관된 빌드: `@repo/config-vite`가 base 경로, HTML include 플러그인, 이미지 경로 치환, 이미지 압축, CSS 옵션, `monorepo` 모드 출력을 공통화합니다.
- 선택 배포: 변경된 프로젝트만 `dist/<프로젝트명>`에 빌드 후 GitHub Pages에 업로드합니다.

## 요구 사항
- Node.js 22.x (저장소 root `.nvmrc` 참고)
- pnpm 10.20.x (Corepack 활성화를 권장)
- macOS/Linux 환경에서 확인된 Vite 6, Turbo 2.5.8

## 빠른 시작
```bash
pnpm install                    # Workspace 전체 의존성 설치
pnpm dev                        # Turborepo apps 프로젝트 일괄 개발환경 실행
pnpm build                      # Turborepo apps 프로젝트 일괄 빌드
pnpm build -- --mode monorepo   # Turborepo apps 프로젝트 GitHub Pages 배포용 일괄 빌드
pnpm dev --filter=@repo/2025-homepage
pnpm build --filter=@repo/2025-homepage
pnpm build --filter=@repo/2025-homepage -- --mode monorepo
```
- `pnpm dev`/`pnpm build`는 모든 프로젝트 대상으로 Turborepo 작업을 실행합니다.
- 개별 프로젝트를 실행하려면 `--filter @repo/<프로젝트명>` 또는 root 경로의 package.json 파일에 `dev:homepage` 등 별도로 스크립트를 추가해 사용할 수 있습니다.
- GitHub Pages 배포와 동일한 산출물을 로컬에서 확인하려면 `--mode monorepo` 옵션을 추가합니다. (CI에서도 동일하게 호출됩니다.)

## root 스크립트
| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | Turborepo로 전체 프로젝트 `dev` 스크립트를 실행 (여러 포트를 동시에 열 때 유용) |
| `pnpm build` | 전체 프로젝트 `build` 작업을 실행. 로컬 베타용이며 GitHub Pages 배포 구조가 필요하면 `-- --mode monorepo` 사용 |
| `pnpm lint` | ESLint 검사 |
| `pnpm format` | Prettier 규칙 일괄 수정 |
| `pnpm clean` | 각 Workspace의 `clean` 태스크 실행 후 root `node_modules`를 삭제하고 재설치 |

## Monorepo 구조
```
.
├── apps/
│   ├── 2025-homepage/
│   └── 2025-some-projects/
│       ├── public/            # 정적 자산
│       ├── src/               # html includes, js, scss 등 프로젝트 소스
│       └── package.json       # 프로젝트 전용 의존성 및 스크립트
│   └── README.md
├── packages/
│   ├── config-eslint/         # ESLint 공유 설정 (@repo/config-eslint)
│   ├── config-prettier/       # Prettier 공유 설정 (@repo/config-prettier)
│   ├── config-vite/           # 캠페인 전용 Vite config 헬퍼 (@repo/config-vite)
│   └── styles/                # 공통 SCSS 유틸 (@repo/styles)
├── scripts/                   # CI에서 사용하는 빌드/정리 스크립트
├── dist/                      # `monorepo` 모드 빌드 결과 모음 (CI 캐시 대상)
├── package.json               # root 스크립트 및 devDependencies
├── pnpm-workspace.yaml        # Workspace 정의
└── turbo.json                 # Turborepo 파이프라인 정의
```

## 공통 패키지 사용법
- `@repo/styles`: reset, variables, mixins 등 SASS 코드 제공, 각 프로젝트에서 import 하여 사용합니다.
  ```scss
  @import '@repo/styles/reset';
  @import '@repo/styles/abstracts/variables';
  ```
- `@repo/config-vite`: `defineCampaignConfig`를 제공하여 `appPath`, HTML include 플러그인, 이미지 최적화, CSS preprocessor 옵션, base 경로, `monorepo` 모드 산출 경로를 일관되게 설정합니다. `vite.config.js`에서는 아래와 같이 사용합니다.
  ```js
  import { defineCampaignConfig } from '@repo/config-vite';
  export default defineCampaignConfig({ appPath: '원하는 산출물 경로/프로젝트 이름' });
  ```
- `@repo/config-eslint`, `@repo/config-prettier`: 자주 사용하는 Lint, Code 포맷 설정 모음입니다.

## GitHub Pages 배포 파이프라인
- Workflow: `.github/workflows/ci.yml`
  1. `scripts/find-changed-apps.mjs`로 변경된 프로젝트를 감지합니다.
  2. 기존 `dist/` 캐시를 복원하고, `scripts/cleanup-deleted-apps.mjs`로 제거된 프로젝트를 최종 산출물에서 정리합니다.
  3. `scripts/build-changed-apps.mjs`가 각 대상 프로젝트를 `pnpm --filter <프로젝트명> run build --mode monorepo`로 빌드해 root `dist/<app>`에 결과를 모읍니다.
  4. 완료된 `dist/`를 Pages 아티팩트로 업로드 후 GitHub Pages에 최종 게시합니다.
- 공통 패키지(`packages/**`)나 루트 설정이 수정되면 모든 프로젝트를 다시 빌드합니다.
- 로컬에서도 동일한 구조의 산출물을 얻고 싶다면 `pnpm build -- --mode monorepo`를 실행합니다.

## 새 프로젝트 추가 가이드
1. `apps/<프로젝트명>/` 폴더를 생성하고 Vite 프로젝트를 구성합니다.
2. `package.json`의 `name`을 `@repo/<프로젝트명>` 형식으로 설정하고 필요한 의존성을 `workspace:*` 버전으로 추가합니다.
3. `vite.config.js`에서 `appPath`를 실제 배포 경로(예: `static/event-name`)로 지정합니다.
4. HTML 조각(`src/includes`), JS 엔트리(`src/js/main.js`), SCSS(`src/css/style.scss`) 구조를 맞춰 작성합니다. 공통 스타일이 필요하면 `@repo/styles`를 import 합니다.
5.
6. `pnpm install` 후 `pnpm dev --filter=@repo/<프로젝트명>`으로 로컬 개발환경 실행, `pnpm build --filter @repo/<프로젝트명> 또는 pnpm build --filter @repo/<프로젝트명> -- --mode monorepo`로 Pages용 산출물을 검증합니다.
7. 수정이 잦은 프로젝트는 root `package.json`에 `dev:<slug>` 또는 `build:<slug>` 스크립트를 추가해두면 편합니다.

## 참고
- 빌드 옵션은 `apps/<프로젝트명>/vite.config.js`에서 직접 수정할 수 있습니다.
- 신규 프로젝트 생성 시, 원하는 대로 구성을 변경할 수 있습니다. (예. SASS 대신 Tailwind CSS 사용, React 사용 등)
- 배포 후 각 프로젝트는 다음 경로에서 확인할 수 있습니다.  
  [https://haneulcho.github.io/vite-monorepo-ui-dev/&lt;프로젝트명&gt;](https://haneulcho.github.io/vite-monorepo-ui-dev/<프로젝트명>)
