"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/domains/auth/components/LoginForm";
import { SignupForm } from "@/domains/auth/components/SignupForm";
import "./AuthModal.css";

interface AuthModalProps {
  onClose: () => void;

  // 모달을 열 때 처음 보여줄 화면
  initialMode?: "login" | "signup";
}

//인증 모달 컴포넌트
export function AuthModal({ onClose, initialMode = "login" }: AuthModalProps) {
  // 현재 모달이 로그인 화면인지 회원가입 화면인지 관리한다.
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // 모달이 열려 있을 때 뒤 페이지 스크롤 막기
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ESC로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="auth-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="auth-modal">
        {/* 왼쪽 */}
        <section className="auth-modal-left">
          <div className="auth-logo-area">
            <Image
              src="/images/tada-logo.png"
              alt="TADA"
              width={150}
              height={80}
              className="auth-logo"
              priority
            />

            <p className="auth-logo-description">
              일상을 기록하고,
              <br />
              나만의 스티커로 기억해요
            </p>
          </div>
        </section>

        {/* 오른쪽 */}
        <section className="auth-modal-right">
          <button
            type="button"
            className="auth-close-button"
            onClick={onClose}
            aria-label="인증 모달 닫기"
          >
            ×
          </button>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>

          <div className="auth-form-area">
            {mode === "login" ? (
              <LoginForm onSuccess={onClose} />
            ) : (
              <SignupForm onSuccess={() => setMode("login")} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}