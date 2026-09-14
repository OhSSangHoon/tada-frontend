"use client";

import { FormEvent, useState } from "react";
import { useSignup } from "@/domains/auth/hooks/useSignup";

export function SignupForm() {
  // 회원가입 폼 입력값을 관리한다.
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

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
    signupMutation.mutate({
      loginId,
      password,
      passwordConfirm,
      nickname,
    });
  };

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
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>

      {/* 비밀번호 확인 입력 */}
      <div>
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />
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

      {/* 회원가입 성공 시 메시지 표시 */}
      {signupMutation.isSuccess && (
        <p>회원가입이 완료되었습니다.</p>
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