"use client";

import { FormEvent, useState } from "react";
import { useLogin } from "@/domains/auth/hooks/useLogin";

export function LoginForm() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  // 로그인 버튼 클릭
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginMutation.mutate({
      loginId,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <button
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "로그인 중..." : "로그인"}
      </button>

      {loginMutation.isError && (
        <p>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "로그인에 실패했습니다."}
        </p>
      )}
    </form>
  );
}

/*
 LoginForm
    ↓
 useLogin()
    ↓
 authApi.login()
    ↓
 apiClient()
    ↓
 백엔드
 */