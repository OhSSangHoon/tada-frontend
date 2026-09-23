"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTrashedDiaries } from "@/domains/diary/hooks/useTrashedDiaries";
import { useRestoreDiary } from "@/domains/diary/hooks/useRestoreDiary";
import { useHasDiaryOnDate } from "@/domains/calendar/hooks/useHasDiaryOnDate";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  SidePanelBody,
  SidePanelHeader,
} from "@/shared/components/side-panel/SidePanelParts";
import { Pagination } from "@/shared/components/Pagination";
import { ApiError } from "@/shared/lib/api-client";
import { formatDisplayDate, formatShortDate } from "@/domains/diary/utils/date";
import type { TrashedDiaryResponse } from "@/domains/diary/types/diary";
import { DIARY_FONT } from "@/domains/diary/utils/fonts";

// 카드 높이(h-[120px])와 카드 사이 간격(gap-3)이라서, 클래스를 바꾸면 여기도 같이 바꿔야 한다
const CARD_HEIGHT = 120;
const CARD_GAP = 12;
const DEFAULT_PAGE_SIZE = 3;

interface TrashPanelProps {
  isOpen: boolean;
}

export function TrashPanel({ isOpen }: TrashPanelProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [confirm, setConfirm] = useState<{
    diary: TrashedDiaryResponse;
    type: "restore" | "replace";
  } | null>(null);

  const { data, isLoading, isError } = useTrashedDiaries(isOpen);
  const restoreMutation = useRestoreDiary();
  const hasDiaryOnDateMutation = useHasDiaryOnDate();

  const diaries = [...(data ?? [])].sort((a, b) =>
    b.entryDate.localeCompare(a.entryDate),
  );
  // 패널 높이(화면 높이에 따라 달라짐)에 카드가 몇 개 들어가는지 재서, 스크롤 없이 한 페이지에 딱 맞게 보여준다
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const observer = new ResizeObserver(() => {
      const paddingBottom = parseFloat(getComputedStyle(body).paddingBottom);
      const fit = Math.floor(
        (body.clientHeight - paddingBottom + CARD_GAP) /
          (CARD_HEIGHT + CARD_GAP),
      );
      setPageSize(Math.max(1, fit));
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(diaries.length / pageSize);
  // 복원으로 목록이 줄어 현재 페이지가 없어지면 마지막 페이지로 맞춘다
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const pageDiaries = diaries.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  // 같은 날짜에 이미 일기가 있으면 복원 확인 없이 바로 교체 여부를 물어본다
  async function handleClickRestore(diary: TrashedDiaryResponse) {
    try {
      const hasDiary = await hasDiaryOnDateMutation.mutateAsync(
        diary.entryDate,
      );
      setConfirm({ diary, type: hasDiary ? "replace" : "restore" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    }
  }

  async function handleConfirmRestore() {
    if (!confirm) return;
    const { diary, type } = confirm;

    try {
      await restoreMutation.mutateAsync({
        id: diary.id,
        replace: type === "replace",
      });
      setConfirm(null);
    } catch (error) {
      // 확인 직후 다른 곳에서 그 날짜에 일기가 생긴 경우를 대비한 안전장치
      if (
        type === "restore" &&
        error instanceof ApiError &&
        error.status === 409
      ) {
        setConfirm({ diary, type: "replace" });
        return;
      }
      setConfirm(null);
      alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    }
  }

  const restoringId = restoreMutation.isPending
    ? restoreMutation.variables?.id
    : undefined;
  const checkingDate = hasDiaryOnDateMutation.isPending
    ? hasDiaryOnDateMutation.variables
    : undefined;

  return (
    <>
      <SidePanelHeader
        title="휴지통"
        badge={data?.length}
        description="삭제한 일기는 30일이 지나면 자동으로 삭제돼요."
      />

      <SidePanelBody ref={bodyRef}>
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFEDD5] border-t-[#F97316]" />
          </div>
        )}
        {isError && (
          <p className="py-16 text-center text-sm text-gray-500">
            불러오기 실패
          </p>
        )}
        {data && diaries.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-400">
            휴지통이 비어 있어요.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {pageDiaries.map((diary) => (
            <li
              key={diary.id}
              className="flex h-[120px] gap-3 overflow-hidden rounded-2xl border border-gray-200 p-3"
            >
              <div className="relative h-24 w-24 shrink-0 rounded-xl bg-[#FFF7ED]">
                {diary.imageUrl && (
                  <Image
                    src={diary.imageUrl}
                    alt={diary.keyword ?? diary.title}
                    fill
                    className="object-contain p-2"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-gray-400">
                    {formatDisplayDate(diary.entryDate)}
                    {diary.weather ? ` · ${diary.weather}` : ""}
                  </p>
                  <button
                    onClick={() => handleClickRestore(diary)}
                    disabled={
                      restoringId === diary.id ||
                      checkingDate === diary.entryDate
                    }
                    className="shrink-0 cursor-pointer rounded-full border border-[#F97316] px-3 py-0.5 text-xs font-medium text-[#F97316] hover:bg-[#FFEDD5] disabled:opacity-40"
                  >
                    {restoringId === diary.id ||
                    checkingDate === diary.entryDate
                      ? "확인 중..."
                      : "복원"}
                  </button>
                </div>
                <p
                  className={`mt-1 truncate font-bold text-[#40312E] ${DIARY_FONT}`}
                >
                  {diary.title}
                </p>
                <p
                  className={`mt-1 line-clamp-2 text-sm text-gray-500 ${DIARY_FONT}`}
                >
                  {diary.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SidePanelBody>

      {totalPages > 1 && (
        <div className="shrink-0 border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={
            confirm.type === "restore" ? (
              <>{formatShortDate(confirm.diary.entryDate)} 일기를 복원할까요?</>
            ) : (
              <>
                {formatShortDate(confirm.diary.entryDate)}에 이미 일기가 있어요.
                <br />
                교체할까요? 기존 일기는 휴지통으로 이동해요.
              </>
            )
          }
          confirmLabel="예"
          cancelLabel="아니오"
          confirmClassName="bg-[#F97316] text-white"
          isPending={restoreMutation.isPending}
          onConfirm={handleConfirmRestore}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
