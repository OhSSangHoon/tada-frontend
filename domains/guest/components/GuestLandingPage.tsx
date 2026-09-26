"use client";

import { DIARY_FONT } from "@/domains/diary/utils/fonts";

interface GuestLandingPageProps {
  // 본문 내 "회원가입하고 시작하기" 버튼 클릭 콜백
  // 실제 모달 열기(+ 로그인/회원가입 탭 전환)는 상위(app/page.tsx 등)에서 AuthModal로 처리
  // 로그인 버튼은 기존 앱 레이아웃(헤더 등)에 이미 있어서 여기서는 별도로 만들지 않음
  onGetStarted: () => void;
}

// public/guest-bg/ 폴더에 저장된 배경 이미지 경로.
const HERO_BG_IMAGE = "/guest-bg/TADA_LOGO-bg.png";

// public/stickers/ 폴더의 실제 스티커 일러스트
const COFFEE_STICKER_IMAGE = "/stickers/coffee.png";

const STEPS = [
  {
    step: 1,
    title: "오늘 있었던 일을 적어요",
    description: "편하게, 있었던 일을 떠오르는 대로 적기만 하면 돼요.",
  },
  {
    step: 2,
    title: "AI가 스티커로 그려줘요",
    description:
      "일기 속 핵심 키워드를 골라 AI가 자동으로 그림 스티커를 만들어요.",
  },
  {
    step: 3,
    title: "달력에 차곡차곡 쌓여요",
    description:
      "완성된 스티커가 그날 날짜에 붙어, 한눈에 보는 그림 다이어리가 돼요.",
  },
];

function BgPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <img
        src={HERO_BG_IMAGE}
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "none",
          opacity: 0.6,
        }}
      />
    </div>
  );
}

export function GuestLandingPage({ onGetStarted }: GuestLandingPageProps) {
  return (
    <div className="bg-black">
      {/* 1섹션: 히어로 */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#F97316] px-6 py-20 md:py-28">
        <BgPattern />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold leading-tight text-[#402E32] md:text-7xl">
              하루를 적으면,
              <br />
              AI가 그림으로 남겨
              <br />
              드려요
            </h1>
            <p className="mt-8 text-2xl leading-relaxed text-white">
              타다는 그날 쓴 일기에서 핵심 키워드를 뽑아 나만의 스티커로
              그려주는 다이어리예요. 고르고 꾸밀 필요 없이, 적기만 하면 매일 한
              장씩 그림 달력이 채워져요.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-12 rounded-full bg-white px-12 py-6 text-xl font-bold text-[#F97316] cursor-pointer hover:brightness-95"
            >
              회원가입하고 시작하기
            </button>
          </div>

          {/* 오른쪽 스티커 미리보기 카드 - 한 단계 더 확대 + 우측 상단으로 50px 이동 */}
          <div className="relative w-full max-w-lg shrink-0 rotate-2 translate-x-[50px] -translate-y-[50px] rounded-3xl bg-[#FDF6EC] p-12 shadow-2xl md:w-[36rem]">
            <div className="absolute -top-5 left-12 h-6 w-28 rounded-sm bg-yellow-300" />
            {/* 커피 스티커 - 카드 우측 상단에 살짝 겹치게 배치 */}
            <img
              src={COFFEE_STICKER_IMAGE}
              alt="커피 스티커"
              className="pointer-events-none absolute -top-20 -right-8 h-48 w-48 object-contain drop-shadow-md"
            />
            <div className="pr-24">
              <p className="text-2xl font-bold text-[#40312E]">
                9월 21일 월요일
              </p>
              <p className={`mt-4 text-2xl text-[#40312E] ${DIARY_FONT}`}>
                오랜만에 민수랑 카페에서
                <br />
                오래 수다 떨었다, 좋았다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2섹션: 이렇게 써요 */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#F97316] px-6 py-20 md:py-28">
        <BgPattern />
        <div className="relative mx-auto w-full max-w-6xl">
          <h2 className="text-5xl font-bold text-white md:text-6xl">
            이렇게 써요
          </h2>
          <p className="mt-4 text-xl text-white/90 md:text-2xl">
            복잡한 설정 없이 세 단계면 충분해요.
          </p>

          <div className="mt-20 grid gap-10 md:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <div
                key={step}
                className="rounded-3xl bg-white/95 p-12 shadow-sm"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F97316] text-xl font-bold text-white">
                  {step}
                </span>
                <p className="mt-8 text-2xl font-bold text-[#40312E]">
                  {title}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3섹션: 하단 CTA */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F97316] px-6 py-20 md:py-28">
        <BgPattern />
        <div className="relative w-full max-w-5xl rounded-3xl bg-white px-16 py-28 text-center shadow-2xl">
          <h3 className="text-4xl font-bold text-[#40312E] md:text-5xl">
            오늘 하루, 스티커 한 장으로 남겨볼까요?
          </h3>
          <p className="mt-6 text-xl text-gray-500">
            가입은 1분이면 충분해요, 오늘의 일기부터 시작해보세요.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-12 rounded-full bg-[#F97316] px-12 py-6 text-xl font-bold text-white cursor-pointer hover:brightness-95"
          >
            회원가입하고 시작하기
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TADA. All rights reserved.
      </footer>
    </div>
  );
}
