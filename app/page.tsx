"use client";

import { useState } from "react";
import { CalendarSection } from "@/domains/calendar/components/CalendarSection";
import { SearchModal } from "@/domains/search/components/SearchModal";
import { SidePanels } from "./SidePanels";
import { useAuthReady } from "@/shared/lib/auth-ready-context";
import { useAccessToken } from "@/shared/lib/token-store";
import { GuestLandingPage } from "@/domains/guest/components/GuestLandingPage";
import { AuthModal } from "@/domains/auth/components/AuthModal";

export default function Home() {
  // 인증 정보 복원이 끝났는지, 로그인된 상태인지를 확인한다.
  const isAuthReady = useAuthReady();
  const accessToken = useAccessToken();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 복원이 끝나기 전에는 게스트 화면이 깜빡이는 것을 막기 위해 아무것도 그리지 않는다.
  if (!isAuthReady) {
    return null;
  }

  // 비로그인: 게스트용 메인화면
  if (!accessToken) {
    return (
      <>
        <GuestLandingPage onGetStarted={() => setIsAuthModalOpen(true)} />
        {isAuthModalOpen && (
          <AuthModal
            initialMode="signup"
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}
        {/* <div className="flex h-screen w-full items-center justify-center">
          <p className="text-gray-500">게스트용 메인화면</p>
        </div> */}
      </>
    );
  }

  // 로그인: 회원용 메인화면
  return (
    <>
      <CalendarSection />
      <SearchModal />
      <SidePanels />
    </>
  );
}
