"use client";

import { useState } from "react";
import { AuthModal } from "@/domains/auth/components/AuthModal";

export function Header() {
  // 로그인 모달이 열려 있는지 관리한다.
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

        {/* 로그인 모달 열기 버튼 */}
        <button
          type="button"
          onClick={onOpen}
        >
          로그인
        </button>
      </header>

      {/* 로그인 버튼을 눌렀을 때 모달을 보여준다. */}
      {isAuthModalOpen && (
        <AuthModal onClose={onClose} />
      )}
    </>
  );
}