"use client";

//로그인 모드와 회원가입 모드를 바꾸기 위해 상태값을 사용한다.
import { useState } from "react";

// 로그인 모드에서 보여줄 로그인 폼을 가져온다.
import { LoginForm } from "@/domains/auth/components/LoginForm";

// 회원가입 모드에서 보여줄 회원가입 폼을 가져온다.
import { SignupForm } from "@/domains/auth/components/SignupForm";

//부모 컴포넌트에서 전달받을 값을 정의한다.
interface AuthModalProps {
  onClose: () => void;

  // 모달을 열 때 처음 보여줄 화면
  initialMode?: "login" | "signup";
}

//인증 모달 컴포넌트
export function AuthModal({ onClose, initialMode = "login" }: AuthModalProps) {
  // 현재 모달이 로그인 화면인지 회원가입 화면인지 관리한다.
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  return (
    // 화면 전체를 덮는 모달 배경
    <div>
      {/* 실제 모달 내용 영역 */}
      <div>
        {/* 모달 닫기 버튼 */}
        <button type="button" onClick={onClose} aria-label="인증 모달 닫기">
          ×
        </button>

        {/* 로그인 / 회원가입 화면 전환 버튼 */}
        <div>
          <button type="button" onClick={() => setMode("login")}>
            로그인
          </button>

          <button type="button" onClick={() => setMode("signup")}>
            회원가입
          </button>
        </div>

        {/* 현재 mode에 따라 보여줄 폼을 변경한다. */}
        {mode === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
