import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/domains/auth/api/authApi";

// 현재 로그인한 사용자 정보를 조회한다.
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });
}

/*
 useMe()
  ↓
 getMe()
  ↓
 GET /api/auth/me
  ↓
 apiClient()
  ↓
 Access Token 자동 첨부
 */