"use client";

import { useMe } from "@/domains/auth/hooks/useMe";

export function MeTest() {
  const { data, isLoading, isError, error } = useMe();

  // 사용자 정보 조회 중
  if (isLoading) {
    return <p>사용자 정보 확인 중...</p>;
  }

  // 사용자 정보 조회 실패
  if (isError) {
    return (
      <p>
        {error instanceof Error
          ? error.message
          : "사용자 정보 조회에 실패했습니다."}
      </p>
    );
  }

  // 사용자 정보가 없는 경우
  if (!data) {
    return <p>사용자 정보가 없습니다.</p>;
  }

  // 사용자 정보 조회 성공
  return (
    <div>
      <p>사용자 UUID: {data.id}</p>
      <p>닉네임: {data.nickname}</p>
    </div>
  );
}