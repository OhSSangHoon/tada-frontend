"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PersonTimelineCard } from "@/domains/curator/components/PersonTimelineCard";
import { usePersonTimeline } from "@/domains/curator/hooks/usePersonTimeline";
import type {
  PersonTimelineItemResponse,
  PersonTimelineSort,
} from "@/domains/curator/types/curator";

interface PersonRecordTabProps {
  personId: string;
  onDiaryOpen: (item: PersonTimelineItemResponse) => void;
}

export function PersonRecordTab({
  personId,
  onDiaryOpen,
}: PersonRecordTabProps) {
  const [sort, setSort] = useState<PersonTimelineSort>("LATEST");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = usePersonTimeline(personId, sort);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry?.isIntersecting &&
          !isFetchingNextPage &&
          !isFetchNextPageError
        ) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "180px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  const initialLoadFailed = isError && items.length === 0;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#40312E]">
            일기 타임라인
          </h3>

          <p className="mt-1 text-[12px] text-[#A09792]">
            함께 등장한 일기를 시간순으로 모았어요.
          </p>
        </div>

        <div className="flex shrink-0 rounded-full bg-[#F8F5F3] p-1">
          <SortButton
            active={sort === "LATEST"}
            onClick={() => setSort("LATEST")}
          >
            최신순
          </SortButton>

          <SortButton
            active={sort === "OLDEST"}
            onClick={() => setSort("OLDEST")}
          >
            오래된순
          </SortButton>
        </div>
      </div>

      {isLoading ? (
        <TimelineSkeleton />
      ) : initialLoadFailed ? (
        <TimelineMessage
          title="기록을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          actionLabel="재시도"
          onAction={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <TimelineMessage
          title="아직 함께한 기록이 없어요"
          description="이 사람과 함께한 일기가 생기면 이곳에 모아드려요."
        />
      ) : (
        <>
          <div className="relative space-y-4 before:absolute before:bottom-5 before:left-[6px] before:top-5 before:w-px before:bg-[#F4D8C5]">
            {items.map((item) => (
              <div key={item.diaryId} className="relative pl-7">
                <span className="absolute left-0 top-6 h-[13px] w-[13px] rounded-full border-[3px] border-white bg-[#F97316] ring-1 ring-[#F2C4A5]" />

                <PersonTimelineCard
                  item={item}
                  onClick={() => onDiaryOpen(item)}
                />
              </div>
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="flex min-h-20 items-center justify-center"
          >
            {isFetchingNextPage ? (
              <span className="text-sm text-[#A09792]">
                기록 불러오는 중...
              </span>
            ) : isFetchNextPageError ? (
              <div className="flex flex-col items-center py-3 text-center">
                <p className="text-[13px] font-semibold text-[#665D58]">
                  더 불러오지 못했어요
                </p>

                <button
                  type="button"
                  onClick={() => void fetchNextPage()}
                  className="mt-2 rounded-xl bg-[#FFF3E8] px-4 py-2 text-[12px] font-bold text-[#F97316] transition hover:bg-[#FFE8D5]"
                >
                  다시 불러오기
                </button>
              </div>
            ) : hasNextPage ? (
              <span className="text-[12px] text-[#B1A7A2]">
                아래로 스크롤하면 더 불러와요.
              </span>
            ) : (
              <span className="text-[12px] text-[#B1A7A2]">
                모든 기록을 불러왔어요.
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

interface SortButtonProps {
  active: boolean;
  onClick: () => void;
  children: string;
}

function SortButton({ active, onClick, children }: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
        active
          ? "bg-[#F97316] text-white shadow-sm"
          : "text-[#8C827D] hover:text-[#F97316]"
      }`}
    >
      {children}
    </button>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[112px] animate-pulse gap-4 rounded-2xl border border-[#F0E9E5] p-4"
        >
          <div className="h-[68px] w-[68px] shrink-0 rounded-2xl bg-[#F5F0ED]" />

          <div className="flex-1">
            <div className="h-3 w-20 rounded bg-[#F0EAE6]" />
            <div className="mt-3 h-4 w-40 rounded bg-[#F0EAE6]" />
            <div className="mt-4 h-5 w-48 rounded bg-[#F5F0ED]" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TimelineMessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function TimelineMessage({
  title,
  description,
  actionLabel,
  onAction,
}: TimelineMessageProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
      <p className="font-semibold text-[#40312E]">{title}</p>

      <p className="mt-1 text-sm text-[#958B86]">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-[#F97316] px-4 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
