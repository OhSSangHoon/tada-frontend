# TADA (타다) Frontend

> 하루를 적으면, AI가 그림으로 남겨드려요.

타다는 그날 쓴 일기에서 핵심 키워드를 뽑아 나만의 스티커로 그려주는 AI 그림 다이어리입니다. 고르고 꾸밀 필요 없이 일기만 적으면 매일 한 장씩 스티커가 달력에 쌓입니다.

이 저장소는 타다의 프론트엔드(Next.js)입니다. 백엔드(Spring Boot)는 별도 저장소로 관리합니다.

## 기술 스택


| 구분          | 사용 기술                                                   |
| ----------- | ------------------------------------------------------- |
| 프레임워크       | Next.js 16 (App Router), React 19, TypeScript           |
| 스타일         | Tailwind CSS 4                                          |
| 서버 상태 / API | TanStack Query + `fetch` 래퍼 (axios, zustand, Redux 미사용) |
| 랜딩 페이지 스크롤  | Swiper                                                  |
| 린트 / 포맷     | ESLint 9 (`eslint-config-next`), Prettier               |


## 시작하기

```bash
npm install
npm run dev        # http://localhost:3000
```

환경 변수는 `.env.local`에 설정합니다.


| 변수                           | 설명                                               |
| ---------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`   | 백엔드 API 주소 (소셜 로그인 기본값은 `http://localhost:8080`) |
| `DIARY_ANALYSIS_WEBHOOK_URL` | 일기 제목/키워드 분석 웹훅 (`app/api/generate-title`에서 사용)  |



| 스크립트                                      | 설명               |
| ----------------------------------------- | ---------------- |
| `npm run dev`                             | 개발 서버            |
| `npm run build` / `npm run start`         | 프로덕션 빌드 / 실행     |
| `npm run lint`                            | ESLint           |
| `npm run format` / `npm run format:check` | Prettier 적용 / 검사 |


---



## 프로젝트 구조

화면은 `/` 라우트 하나뿐인 SPA에 가깝고, 도메인별 화면은 index 위에 섹션이나 모달로 뜹니다. 그래서 `domains/`는 라우트가 아니라 **컴포넌트/모달 소유권** 기준으로 나뉩니다.

```
tada-frontend/
├── app/                  # 라우팅 전용 (layout, page, providers)
├── domains/              # 도메인별 로직
│   ├── auth/             # 로그인/회원가입 모달
│   ├── calendar/         # 메인 캘린더
│   ├── diary/            # 일기 작성/상세 모달, 휴지통
│   ├── sticker/          # 스티커 앨범
│   ├── search/           # AI 일기 검색
│   ├── curator/          # 인물 / 추억 다시 꺼내보기
│   └── guest/            # 비로그인 랜딩 페이지
├── shared/               # 공통 (Header/Footer, 공용 UI, api-client, token-store)
└── public/               # 정적 이미지 (스티커, 배경)
```

각 도메인은 `api/`, `components/`, `hooks/`, `types/`(필요 시 `utils/`) 폴더로 구성합니다. `app/page.tsx`는 각 도메인의 섹션/모달을 조립만 하는 얇은 파일로 유지합니다.

자세한 구조와 결정 배경은 `[frontend_directory_structure.md](./frontend_directory_structure.md)`를 참고하세요.

---



## 기능 소개



### 게스트 랜딩 (`domains/guest`)

- 비로그인 사용자에게 보이는 소개 페이지입니다. 히어로, 이렇게 써요, CTA 3개 섹션으로 구성됩니다.
- Swiper로 휠 한 번에 섹션 하나씩 넘어가는 풀페이지 스크롤이며, 마지막 섹션 이후에는 전역 Footer로 이어집니다.
- "회원가입하고 시작하기" 버튼으로 회원가입 모달을 엽니다.



### 인증 (`domains/auth`)

- 아이디/비밀번호 로그인과 회원가입, 소셜 로그인(Google/Kakao)을 모달로 제공합니다.
- accessToken은 메모리(`shared/lib/token-store.ts`)에만 두고, refreshToken은 sessionStorage에 보관합니다.
- 401 응답 시 `/api/auth/reissue`로 accessToken을 재발급하고 원 요청을 1회 재시도합니다. 앱 부팅 시 refreshToken이 있으면 조용히 복원해서 새로고침해도 로그인이 유지됩니다.



### 캘린더 (`domains/calendar`)

- 라이브러리 없이 CSS Grid로 직접 구현한 월간 캘린더입니다. 날짜마다 그날의 스티커가 붙습니다.
- 연/월 휠 피커로 월을 이동합니다.
- 빈 날짜를 누르면 일기 작성 모달, 채워진 날짜를 누르면 일기 상세 모달이 열립니다. 페이지 이동은 없습니다.
- 일기를 휴지통 영역으로 드래그해서 삭제할 수 있습니다.



### 일기 작성 / 상세 / 휴지통 (`domains/diary`)

1. 일기를 작성하고 제출하면 AI가 제목(20자 이내)과 키워드 3개를 추출합니다.
2. 제목은 수정 가능한 입력창으로 보이고, 키워드는 하나만 고릅니다.
3. 키워드를 고르면 스티커가 생성됩니다. 같은 키워드로 1회 재생성할 수 있습니다.
4. 확인 버튼을 누르면 일기, 제목, 키워드, 스티커가 한 번에 저장됩니다.

삭제한 일기는 휴지통 패널에서 복구하거나 영구 삭제할 수 있습니다.

### 스티커 앨범 (`domains/sticker`)

- 지금까지 생성된 스티커를 모아 보는 그리드 패널입니다. 정렬 옵션과 페이지네이션을 지원합니다.



### 검색 (`domains/search`)

- 일기 내용을 자연어로 물어보는 AI 검색 모달입니다.
- 결과는 무한 스크롤이 아니라 페이지네이션으로 보여주고, 결과가 많으면 최대 15개까지만 보여줍니다.
- 결과를 누르면 일기 상세 모달이 열립니다. 스티커가 없는 일기는 폴백 이미지를 사용합니다.



### 큐레이터 (`domains/curator`)

- **내 기록 속 사람들:** 일기에 등장한 인물을 자동으로 모아 보여주고, 인물별 타임라인, 기록, 추억을 확인할 수 있습니다. 잘못 인식된 인물은 교정할 수 있습니다.
- **다시 꺼내본 일기:** 지난 일기를 다시 꺼내 보여주는 패널입니다.



### 사이드 패널 (`app/SidePanels.tsx`)

- 화면 오른쪽 사이드 레일에서 다시 꺼내본 일기, 내 기록 속 사람들, 스티커 앨범, 휴지통 패널을 열고 로그아웃할 수 있습니다.

---



## 개발 컨벤션



### 브랜치 / PR

- 기준 브랜치는 `develop`이고, 기능별로 브랜치를 만들어 `develop`으로 PR을 올립니다.
- 브랜치명은 `feat/기능명`, `fix/내용`, `chore/내용` 형식을 사용합니다.
- 다른 도메인 폴더(`domains/*`)는 담당자를 확인하고 수정합니다. `shared/**`는 공통 영역이라 변경 시 담당자와 먼저 논의합니다.
- PR은 팀장의 리뷰를 받고 머지합니다. 리뷰 반영 후에는 같은 브랜치에 커밋을 추가합니다.



### 커밋 메시지

`type: 한글 설명` 형식을 사용합니다. 도메인을 밝히고 싶으면 `type(scope): 설명`도 가능합니다 (예: `fix(search): ...`).


| type       | 용도                      |
| ---------- | ----------------------- |
| `feat`     | 기능 추가                   |
| `fix`      | 버그 수정, 리뷰 반영            |
| `refactor` | 동작 변경 없는 구조 개선          |
| `style`    | 스타일 변경 (Tailwind, 포맷 등) |
| `chore`    | 설정, 의존성, 파일 정리          |
| `docs`     | 문서, 이미지 등               |


```
feat: 게스트 랜딩페이지 풀페이지 스크롤 추가
fix(search): 검색 페이지 이동 시 재임베딩 제거
chore: 사용하지 않는 스티커 이미지 삭제
```



### PR 전 체크

```bash
npm run lint
npx prettier --check <변경한 파일>
npx tsc --noEmit
```

- 의존성을 추가할 때는 `develop`의 `package-lock.json` 기준으로 `npm install <패키지>`만 실행해서 lock 파일 diff가 그 패키지 관련 줄로 한정되게 합니다.
- 다른 팀원이 새 의존성이 포함된 PR을 머지받으면 `npm install`을 다시 실행해야 합니다.

---



## 코드 컨벤션



### 파일 / 이름


| 종류                    | 규칙                            | 예시                                    |
| --------------------- | ----------------------------- | ------------------------------------- |
| 컴포넌트 파일               | PascalCase, 파일명 = 컴포넌트명       | `DiaryCard.tsx`                       |
| 훅                     | camelCase + `use` 접두사         | `useDiaryForm.ts`                     |
| API 함수 모음             | camelCase + `Api` 접미사         | `diaryApi.ts`                         |
| 타입 정의                 | camelCase 파일, 타입명은 PascalCase | `DiaryResponse`                       |
| Props 타입              | `{컴포넌트명}Props`                | `DiaryCardProps`                      |
| Request / Response 타입 | 백엔드 DTO 이름 그대로                | `CreateDiaryRequest`, `DiaryResponse` |




### 변수 / 함수

- 변수와 함수는 camelCase, 상수는 UPPER_SNAKE_CASE (`MAX_TITLE_LENGTH`).
- boolean은 `is`/`has` 접두사 (`isLoading`, `hasError`), 배열은 복수형 (`diaries`).
- 이벤트 핸들러는 `handle` 접두사 (`handleSubmit`), prop으로 넘길 때는 `on` 접두사 (`onDiaryClick`).
- API 호출 함수의 동사 규칙은 다음과 같습니다.
  - 단건 조회 `getDiary(id)`, 목록 조회 `getAllDiaries()`
  - 생성 `createDiary(form)`, 수정 `updateDiary(id, form)`, 삭제 `deleteDiary(id)`



### 데이터 호출

- **컴포넌트에서** `fetch`**를 직접 호출하지 않습니다.** `domains/*/api/*.ts`의 함수를 `domains/*/hooks/`에서 `useQuery` / `useMutation`으로 감싸 컴포넌트에 노출합니다.
- API 경로는 백엔드 URL 규칙을 그대로 사용하고, 각 도메인의 `api/*.ts`는 자기 도메인 경로만 호출합니다.
- 서버와 대응되지 않는 순수 UI 상태(모달, 토글)만 `useState` / `useContext`로 처리합니다.



### 보안

- `dangerouslySetInnerHTML`을 사용하지 않습니다. 일기 내용 등은 `{content}`로만 렌더링하고, 검색어 하이라이트는 `<mark>` JSX로 처리합니다.
- 토큰을 `localStorage`에 저장하지 않습니다.



### 스타일 / 포맷

- Prettier 설정: 세미콜론 사용, 큰따옴표, `trailingComma: all`, 들여쓰기 2칸, 한 줄 80자.
- ESLint는 `eslint-config-next`(core-web-vitals + typescript)를 사용하며 Prettier와 충돌하는 규칙은 꺼져 있습니다.
- 이미지는 `<img>` 대신 `next/image`의 `Image`를 사용합니다. Supabase Storage 이미지는 `next.config.ts`의 `remotePatterns`에 등록되어 있습니다.
- 스타일은 Tailwind 유틸리티 클래스를 우선 사용하고, 색상 표기는 대소문자를 통일합니다 (예: `#F97316`).
- 주석은 한글로, "무엇"보다 "왜 이렇게 했는지"를 적습니다.



### 폰트

- 세방고딕(`--font-sebang-gothic`), 교보 손글씨(`--font-kyobo-handwriting`)는 `app/layout.tsx`에서 로드합니다. 일기 본문은 손글씨 폰트를 사용합니다.

---



## 참고 문서

- `[frontend_directory_structure.md](./frontend_directory_structure.md)`: 프론트엔드 구조, 네이밍, 확정된 결정 사항
- `[tada_directory_structure.md](./tada_directory_structure.md)`: 백엔드 패키지 구조
- `PR-*-review.md`: PR 코드 리뷰 기록

