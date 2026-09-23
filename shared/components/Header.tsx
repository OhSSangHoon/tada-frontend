"use client";

import { useState } from "react";
import { AuthModal } from "@/domains/auth/components/AuthModal";
import { useMe } from "@/domains/auth/hooks/useMe";
import { useLogout } from "@/domains/auth/hooks/useLogout";
import { useAuthReady } from "@/shared/lib/auth-ready-context";

export function Header() {
  // 로그인 모달이 열려 있는지 관리한다.
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 앱 시작 시 인증 정보 복원이 끝났는지 확인한다.
  const isAuthReady = useAuthReady();

  // 현재 로그인한 사용자 정보를 조회한다.
  const { data: me } = useMe();

  // 로그아웃 요청을 관리한다.
  const logoutMutation = useLogout();

  // 로그인 모달을 연다.
  const onOpen = () => {
    setIsAuthModalOpen(true);
  };

  // 로그인 모달을 닫는다.
  const onClose = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <header className="bg-gray-100 shadow-lg p-4 rounded-md mx-auto w-full">
        <h1 className="text-3xl font-bold">Header</h1>

        {/* 인증 상태에 따라 로그인 또는 사용자 정보를 보여준다. */}
        {!isAuthReady ? (
          // 인증 정보를 복원하는 동안 버튼이 잠깐 보이는 것을 방지한다.
          <div className="h-6" />
        ) : me ? (
          <>
            {/* 로그인 상태 */}
            <span>{me.nickname}님&nbsp;</span>

            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </button>
          </>
        ) : (
          // 로그아웃 상태
          <button type="button" onClick={onOpen}>
            로그인
          </button>
        )}
      </header>

      {/* 로그인 버튼을 눌렀을 때 모달을 보여준다. */}
      {isAuthModalOpen && <AuthModal onClose={onClose} />}
    </>
  );
}
