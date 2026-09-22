import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  setAccessToken,
  setRefreshToken,
} from "@/shared/lib/token-store";

type SocialProvider = "google" | "kakao" | "naver";

interface OAuthMessage {
  type: "oauth-success";
  auth: {
    accessToken: string;
    refreshToken: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function useSocialLogin(onSuccess: () => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<OAuthMessage>) => {
      // 백엔드에서 보낸 메시지만 허용한다.
      if (event.origin !== new URL(API_BASE_URL).origin) {
        return;
      }

      // 소셜 로그인 성공 메시지만 처리한다.
      if (event.data?.type !== "oauth-success") {
        return;
      }

      const accessToken = event.data.auth?.accessToken;
      const refreshToken = event.data.auth?.refreshToken;

      // 토큰 값이 없으면 처리하지 않는다.
      if (!accessToken || !refreshToken) {
        return;
      }

      // Access Token은 메모리에 저장한다.
      setAccessToken(accessToken);

      // Refresh Token은 sessionStorage에 저장한다.
      setRefreshToken(refreshToken);

      // 현재 로그인한 사용자 정보를 다시 조회한다.
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });

      // 로그인 성공 후 인증 모달을 닫는다.
      onSuccess();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSuccess, queryClient]);

  const socialLogin = (provider: SocialProvider) => {
    window.open(
      `${API_BASE_URL}/oauth2/authorization/${provider}`,
      "social-login",
      "width=500,height=700",
    );
  };

  return { socialLogin };
}