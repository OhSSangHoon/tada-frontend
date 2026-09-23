"use client";

import { FormEvent, useState } from "react";
import { useSignup } from "@/domains/auth/hooks/useSignup";

// 회원가입 성공 후 실행할 함수를 부모에게서 전달받는다.
interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  // 회원가입 폼 입력값을 관리한다.
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 회원가입 API 요청 상태를 관리한다.
  const signupMutation = useSignup();

  // 회원가입 버튼 클릭 시 실행된다.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 비밀번호와 비밀번호 확인이 같은지 먼저 확인한다.
    if (password !== passwordConfirm) {
      return;
    }

    // 입력한 값을 회원가입 요청으로 전달한다.
    // 성공 메시지를 먼저 보여줘야 하므로, 로그인 화면 전환(onSuccess)은
    // 사용자가 직접 버튼을 눌렀을 때만 실행한다.
    signupMutation.mutate({
      loginId,
      password,
      passwordConfirm,
      nickname,
    });
  };

  // 회원가입이 끝나면 폼 대신 완료 메시지와 로그인 이동 버튼을 보여준다.
  if (signupMutation.isSuccess) {
    return (
      <div>
        <p>회원가입이 완료되었습니다.</p>
        <button type="button" onClick={onSuccess}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 아이디 입력 */}
      <div>
        <label htmlFor="loginId">아이디</label>
        <input
          id="loginId"
          type="text"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          placeholder="아이디를 입력하세요"
          required
        />
      </div>

      {/* 비밀번호 입력 */}
      <div>
        <label htmlFor="password">비밀번호</label>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
        >
          {showPassword ? "숨기기" : "보기"}
        </button>
      </div>

      {/* 비밀번호 확인 입력 */}
      <div>
        <label htmlFor="passwordConfirm">비밀번호 확인</label>

        <input
          id="passwordConfirm"
          type={showPasswordConfirm ? "text" : "password"}
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />

        <button
          type="button"
          onClick={() => setShowPasswordConfirm((prev) => !prev)}
          aria-pressed={showPasswordConfirm}
        >
          {showPasswordConfirm ? "숨기기" : "보기"}
        </button>
      </div>

      {/* 닉네임 입력 */}
      <div>
        <label htmlFor="nickname">닉네임</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임을 입력하세요"
          required
        />
      </div>

      {/* 회원가입 요청 버튼 */}
      <button type="submit" disabled={signupMutation.isPending}>
        {signupMutation.isPending ? "회원가입 중..." : "회원가입"}
      </button>

      {/* 비밀번호가 일치하지 않을 때 에러 메시지 표시 */}
      {password !== passwordConfirm && passwordConfirm.length > 0 && (
        <p>비밀번호가 일치하지 않습니다.</p>
      )}

      {/* 회원가입 실패 시 백엔드 에러 메시지 표시 */}
      {signupMutation.isError && (
        <p>
          {signupMutation.error instanceof Error
            ? signupMutation.error.message
            : "회원가입에 실패했습니다."}
        </p>
      )}
    </form>
  );
}