"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";
import { useMe } from "@/domains/auth/hooks/useMe";
import { useMemoryRecall } from "@/domains/curator/hooks/useMemoryRecall";
import { SidePanelHeader } from "@/shared/components/side-panel/SidePanelParts";

import type {
  MemoryRecallResponse,
  MemoryRecallType,
} from "@/domains/curator/types/curator";

const FALLBACK_STICKER_IMAGE = "/stickers/goodday.png";
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

interface StoredMemoryRecall {
  periodKey: string;
  recall: MemoryRecallResponse | null;
  seen: boolean;
}

interface MemoryRecallPanelProps {
  isOpen: boolean;
}

export function MemoryRecallPanel({ isOpen }: MemoryRecallPanelProps) {
  const [excludeDiaryId, setExcludeDiaryId] = useState<string | null>(null);
  const [selectedRecall, setSelectedRecall] =
    useState<MemoryRecallResponse | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [storedRecall, setStoredRecall] = useState<
    StoredMemoryRecall | undefined
  >(undefined);
  const [shouldFetchRecall, setShouldFetchRecall] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: me } = useMe();
  const userId = me?.id ?? null;
  const [periodKey, setPeriodKey] = useState(() => getKstNoonPeriodKey());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPeriodKey(getKstNoonPeriodKey());
    }, getMillisecondsUntilNextKstNoon());

    return () => {
      clearTimeout(timeoutId);
    };
  }, [periodKey]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isPlaceholderData,
    refetch,
  } = useMemoryRecall(
    !!userId && storedRecall !== undefined && shouldFetchRecall,
    excludeDiaryId,
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (!userId) {
      timeoutId = setTimeout(() => {
        setStoredRecall(undefined);
        setShouldFetchRecall(false);
      }, 0);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }

    const storageKey = getMemoryRecallStorageKey(userId);

    try {
      const rawValue = localStorage.getItem(storageKey);
      const parsed = rawValue
        ? (JSON.parse(rawValue) as StoredMemoryRecall)
        : null;

      if (parsed?.periodKey === periodKey) {
        timeoutId = setTimeout(() => {
          setStoredRecall(parsed);
          setShouldFetchRecall(false);
        }, 0);

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      }

      localStorage.removeItem(storageKey);
    } catch {
      localStorage.removeItem(storageKey);
    }

    timeoutId = setTimeout(() => {
      setStoredRecall(nullRecallState(periodKey));
      setShouldFetchRecall(true);
    }, 0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [periodKey, userId]);

  useEffect(() => {
    if (
      !userId ||
      !isSuccess ||
      isFetching ||
      isPlaceholderData ||
      !shouldFetchRecall
    ) {
      return;
    }

    const nextStoredRecall: StoredMemoryRecall = {
      periodKey,
      recall: data ?? null,
      seen: isOpen,
    };

    writeStoredRecall(userId, nextStoredRecall);

    const timeoutId = setTimeout(() => {
      setStoredRecall(nextStoredRecall);
      setShouldFetchRecall(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    data,
    isFetching,
    isOpen,
    isPlaceholderData,
    isSuccess,
    periodKey,
    shouldFetchRecall,
    userId,
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      !userId ||
      !storedRecall ||
      storedRecall.seen ||
      shouldFetchRecall
    ) {
      return;
    }

    const seenRecall = {
      ...storedRecall,
      seen: true,
    };

    writeStoredRecall(userId, seenRecall);

    const timeoutId = setTimeout(() => {
      setStoredRecall(seenRecall);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, shouldFetchRecall, storedRecall, userId]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function handleScroll() {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  }

  function showAnotherRecall() {
    const currentRecall = storedRecall?.recall ?? data ?? null;

    if (!currentRecall || isFetching) {
      return;
    }

    if (shouldFetchRecall && isError) {
      void refetch();
      return;
    }

    setExcludeDiaryId(currentRecall.diaryId);
    setShouldFetchRecall(true);
  }

  const recall = shouldFetchRecall
    ? (data ?? storedRecall?.recall ?? null)
    : (storedRecall?.recall ?? null);

  const isInitialLoading =
    storedRecall === undefined ||
    (shouldFetchRecall && !storedRecall.recall && isLoading);

  const showInitialError = isError && !storedRecall?.recall;

  return (
    <>
      <div className="shrink-0 bg-white">
        <SidePanelHeader
          title="다시 꺼내본 일기"
          description="잊고 있던 하루를 오늘 다시 만나보세요."
        />
      </div>

      <div
        onScroll={handleScroll}
        className={`
          min-h-0 flex-1 overflow-y-auto px-6 pb-6
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          ${
            isScrolling
              ? "[&::-webkit-scrollbar-thumb]:bg-[#AEA49F]"
              : "[&::-webkit-scrollbar-thumb]:bg-transparent"
          }
        `}
      >
        {isInitialLoading ? (
          <MemoryRecallSkeleton />
        ) : showInitialError ? (
          <MemoryRecallMessage
            title="일기를 꺼내오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            actionLabel="다시 시도"
            onAction={() => void refetch()}
          />
        ) : recall ? (
          <MemoryRecallCard
            recall={recall}
            isChanging={isFetching}
            onOpen={() => setSelectedRecall(recall)}
            onChange={showAnotherRecall}
          />
        ) : (
          <MemoryRecallMessage
            title={
              excludeDiaryId
                ? "다른 추억은 아직 없어요"
                : "꺼내볼 일기가 아직 없어요"
            }
            description={
              excludeDiaryId
                ? "조금 전의 일기를 다시 보거나, 일기가 더 쌓인 뒤 찾아와 주세요."
                : "일기를 차곡차곡 남기면 다시 보고 싶은 하루를 골라드릴게요."
            }
            actionLabel={excludeDiaryId ? "처음 일기 다시 보기" : undefined}
            onAction={
              excludeDiaryId ? () => setExcludeDiaryId(null) : undefined
            }
          />
        )}
      </div>

      {selectedRecall && (
        <DiaryDetailModal
          diaryId={selectedRecall.diaryId}
          imageUrl={selectedRecall.stickerUrl ?? FALLBACK_STICKER_IMAGE}
          onClose={() => setSelectedRecall(null)}
        />
      )}
    </>
  );
}

interface MemoryRecallCardProps {
  recall: MemoryRecallResponse;
  isChanging: boolean;
  onOpen: () => void;
  onChange: () => void;
}

function MemoryRecallCard({
  recall,
  isChanging,
  onOpen,
  onChange,
}: MemoryRecallCardProps) {
  const message = recall.message ?? "문득 다시 보고 싶은 하루예요.";

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#EEE9E6] bg-white shadow-[0_10px_30px_rgba(64,49,46,0.06)]">
      <div className="relative min-h-[214px] overflow-hidden bg-[#FFF8F2] p-5">
        <div className="relative z-10 max-w-[220px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#F97316] shadow-[0_2px_10px_rgba(64,49,46,0.05)]">
            <SparkIcon />
            {getEventLabel(recall.eventType)}
          </span>

          <p className="mt-4 text-[14px] font-semibold leading-6 text-[#6F6661]">
            {message}
          </p>

          <h3 className="mt-2 line-clamp-2 text-[20px] font-bold leading-7 tracking-[-0.025em] text-[#40312E]">
            {recall.title}
          </h3>
        </div>

        <div className="absolute bottom-4 right-4 flex h-[132px] w-[132px] items-center justify-center rounded-[28px] bg-white/70">
          <div className="relative h-[116px] w-[116px]">
            <Image
              src={recall.stickerUrl ?? FALLBACK_STICKER_IMAGE}
              alt=""
              fill
              sizes="116px"
              className="object-contain p-1 drop-shadow-[0_4px_5px_rgba(64,49,46,0.1)]"
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-[12px] font-bold text-[#F97316]">
          {formatRecallDate(recall.entryDate)}
        </p>

        <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-[14px] leading-6 text-[#5F5651]">
          {recall.contentPreview || "그날의 일기를 다시 열어 확인해 보세요."}
        </p>

        {recall.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {recall.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="max-w-[132px] truncate rounded-full bg-[#F6F3F1] px-2.5 py-1 text-[11px] font-medium text-[#6F6661]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F97316] text-[14px] font-bold text-white transition hover:bg-[#EA6A0B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/30"
        >
          그날의 일기 다시 보기
          <ArrowIcon />
        </button>

        <button
          type="button"
          onClick={onChange}
          disabled={isChanging}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[14px] text-[12px] font-semibold text-[#7E746F] transition hover:bg-[#F8F5F3] hover:text-[#F97316] disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshIcon className={isChanging ? "animate-spin" : ""} />
          {isChanging ? "다른 기억 찾는 중..." : "다른 일기 꺼내보기"}
        </button>
      </div>
    </article>
  );
}

interface MemoryRecallMessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function MemoryRecallMessage({
  title,
  description,
  actionLabel,
  onAction,
}: MemoryRecallMessageProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#FFF7ED] text-[#F97316]">
        <MemoryBookIcon />
      </div>

      <p className="mt-5 text-[16px] font-bold text-[#40312E]">{title}</p>
      <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-[#7E746F]">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#FFF0E4] px-4 py-2.5 text-[12px] font-bold text-[#F97316]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function MemoryRecallSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[22px] border border-[#EEE9E6] bg-white">
      <div className="h-[214px] bg-[#FFF8F2] p-5">
        <div className="h-7 w-24 rounded-full bg-[#F3E8E0]" />
        <div className="mt-5 h-4 w-44 rounded bg-[#F1E7E0]" />
        <div className="mt-3 h-6 w-48 rounded bg-[#EDE2DA]" />
      </div>
      <div className="p-5">
        <div className="h-4 w-28 rounded bg-[#F1ECE9]" />
        <div className="mt-4 h-20 rounded-xl bg-[#F8F5F3]" />
        <div className="mt-5 h-11 rounded-[14px] bg-[#F2EAE5]" />
      </div>
    </div>
  );
}

function getEventLabel(eventType: MemoryRecallType) {
  const labels: Record<MemoryRecallType, string> = {
    TWELVE_MONTHS_AGO: "1년 전 오늘쯤",
    SIX_MONTHS_AGO: "6개월 전 오늘쯤",
    THREE_MONTHS_AGO: "3개월 전 오늘쯤",
    PERSON: "함께한 사람",
    PLACE: "기억 속 장소",
    ACTIVITY: "다시 떠오른 활동",
    SAME_WEEKDAY: "지난 같은 요일",
    FIRST_ENTRY: "나의 첫 기록",
    FALLBACK: "오늘의 기억",
  };

  return labels[eventType];
}

function formatRecallDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${year}년 ${Number(month)}월 ${Number(day)}일의 기록`;
}

function getKstNoonPeriodKey(now = new Date()) {
  const kstDate = new Date(now.getTime() + KST_OFFSET_MS);

  if (kstDate.getUTCHours() < 12) {
    kstDate.setUTCDate(kstDate.getUTCDate() - 1);
  }

  return [
    kstDate.getUTCFullYear(),
    String(kstDate.getUTCMonth() + 1).padStart(2, "0"),
    String(kstDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getMillisecondsUntilNextKstNoon(now = new Date()) {
  const kstDate = new Date(now.getTime() + KST_OFFSET_MS);
  const nextNoonAsUtc = Date.UTC(
    kstDate.getUTCFullYear(),
    kstDate.getUTCMonth(),
    kstDate.getUTCDate(),
    12,
  );
  const currentAsUtc = kstDate.getTime();
  const nextBoundary =
    nextNoonAsUtc > currentAsUtc
      ? nextNoonAsUtc
      : nextNoonAsUtc + 24 * 60 * 60 * 1000;

  return nextBoundary - currentAsUtc + 100;
}

function getMemoryRecallStorageKey(userId: string) {
  return `tada:memory-recall:${userId}`;
}

function nullRecallState(periodKey: string): StoredMemoryRecall {
  return {
    periodKey,
    recall: null,
    seen: false,
  };
}

function writeStoredRecall(userId: string, value: StoredMemoryRecall) {
  try {
    localStorage.setItem(
      getMemoryRecallStorageKey(userId),
      JSON.stringify(value),
    );
  } catch {
    // 저장소 사용이 제한된 환경에서도 API 결과는 그대로 보여준다.
  }
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="currentColor"
    >
      <path d="M12 2c.7 5.3 4.1 8.7 9.4 9.4C16.1 12.1 12.7 15.5 12 21c-.7-5.5-4.1-8.9-9.4-9.6C7.9 10.7 11.3 7.3 12 2Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 9A7 7 0 0 1 18 6l2 2M18 15a7 7 0 0 1-11.9 3L4 16" />
    </svg>
  );
}

function MemoryBookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" />
      <path d="M5 19V5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h15" />
      <path d="m12.5 7 .7 1.8L15 9.5l-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  );
}
