"use client";

import { useMe } from "@/domains/auth/hooks/useMe";
import { sebangGothicRegular } from "@/domains/calendar/utils/fonts";

// 메인페이지 좌측의 "○○님 어서오세요" 알약. 화면을 따라다니지 않고, 부모(relative) 맨 위 = 캘린더 카드 상단에 맞춘다.
export function WelcomePill() {
  const { data: me } = useMe();

  if (!me) return null;

  return (
    <div className="absolute left-[3.3vw] top-0 flex h-[68px] w-[240px] flex-col items-center justify-center gap-[6px] rounded-[34px] bg-[#40312E] leading-none">
      <span
        className="text-[17px] text-[#E98B50]"
        style={{
          fontFamily: "var(--font-sebang-gothic), sans-serif",
          fontWeight: 700,
        }}
      >
        {me.nickname}님
      </span>
      <span
        className={`text-[13px] text-[#B8B8B8] ${sebangGothicRegular.className}`}
      >
        어서오세요
      </span>
    </div>
  );
}
