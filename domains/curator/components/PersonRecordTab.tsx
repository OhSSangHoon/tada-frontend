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
  onCorrectionRequest: (item: PersonTimelineItemResponse) => void;
  openMenuDiaryId: string | null;
  onOpenMenuDiaryIdChange: (diaryId: string | null) => void;
}

interface MonthGroup {
  key: string;
  label: string;
  items: PersonTimelineItemResponse[];
}

export function PersonRecordTab({
  personId,
  onDiaryOpen,
  onCorrectionRequest,
  openMenuDiaryId,
  onOpenMenuDiaryIdChange,
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

  const monthGroups = useMemo<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];

    for (const item of items) {
      const monthKey = item.entryDate.slice(0, 7);
      const previous = groups.at(-1);

      if (previous?.key === monthKey) {
        previous.items.push(item);
      } else {
        groups.push({
          key: monthKey,
          label: formatMonth(item.entryDate),
          items: [item],
        });
      }
    }

    return groups;
  }, [items]);

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
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#40312E]">
            일기 타임라인
          </h3>
          <p className="mt-1 text-[12px] text-[#7E746F]">
            함께한 기록을 시간순으로 모았어요.
          </p>
        </div>

        <div className="flex shrink-0 rounded-[13px] bg-[#F6F3F1] p-1">
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
          description="함께한 일기가 생기면 이곳에 모아드려요."
        />
      ) : (
        <>
          <div className="space-y-6">
            {monthGroups.map((group) => (
              <section key={group.key}>
                <div className="flex items-center justify-between border-b border-[#EEE9E6] px-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-[#F97316]" />

                    <h3 className="text-[16px] font-bold text-[#40312E]">
                      {group.label}
                    </h3>
                  </div>

                  <span className="text-[11px] font-medium text-[#7E746F]">
                    {group.items.length}개의 기록
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {group.items.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === group.items.length - 1;

                    return (
                      <div
                        key={item.diaryId}
                        className="grid grid-cols-[52px_20px_minmax(0,1fr)] items-stretch gap-x-3"
                      >
                        <div className="self-center text-center">
                          <p className="text-[20px] font-bold leading-none text-[#40312E]">
                            {getDay(item.entryDate)}
                          </p>

                          <p className="mt-1 text-[11px] font-medium text-[#7E746F]">
                            {getWeekday(item.entryDate)}
                          </p>
                        </div>

                        <div className="relative flex min-h-[92px] items-center justify-center">
                          {!isFirst && (
                            <span className="absolute -top-3 bottom-1/2 left-1/2 w-px -translate-x-1/2 bg-[#F4C8AA]" />
                          )}

                          {!isLast && (
                            <span className="absolute -bottom-3 left-1/2 top-1/2 w-px -translate-x-1/2 bg-[#F4C8AA]" />
                          )}

                          <span className="relative z-10 h-3 w-3 rounded-full border-[3px] border-white bg-[#F97316] shadow-[0_0_0_1px_#F5AE7A]" />
                        </div>

                        <div className="min-w-0">
                          <PersonTimelineCard
                            item={item}
                            isMenuOpen={openMenuDiaryId === item.diaryId}
                            onMenuOpenChange={(isOpen) =>
                              onOpenMenuDiaryIdChange(
                                isOpen ? item.diaryId : null,
                              )
                            }
                            onClick={() => onDiaryOpen(item)}
                            onCorrectionRequest={() =>
                              onCorrectionRequest(item)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="flex min-h-14 items-center justify-center"
          >
            {isFetchingNextPage ? (
              <span className="text-[12px] text-[#7E746F]">
                기록 불러오는 중...
              </span>
            ) : isFetchNextPageError ? (
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                className="rounded-xl bg-[#FFF3E8] px-4 py-2 text-[12px] font-bold text-[#F97316]"
              >
                다시 불러오기
              </button>
            ) : hasNextPage ? (
              <span className="text-[11px] text-[#8B817C]">
                아래로 스크롤하면 더 불러와요.
              </span>
            ) : (
              <span className="text-[11px] text-[#8B817C]">
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
      className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold transition ${
        active
          ? "bg-white text-[#F97316] shadow-[0_2px_8px_rgba(64,49,46,0.08)]"
          : "text-[#8C827D] hover:text-[#F97316]"
      }`}
    >
      {children}
    </button>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-9 animate-pulse border-b border-[#EEE9E6] bg-white" />

      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-3">
          <div className="h-10 w-12 rounded-lg bg-[#F5F0ED]" />
          <div className="h-[76px] flex-1 rounded-[13px] bg-[#F8F5F3]" />
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
    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
      <p className="text-[14px] font-semibold text-[#40312E]">{title}</p>

      <p className="mt-1 text-[12px] text-[#958B86]">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-[#F97316] px-4 py-2 text-[12px] font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function formatMonth(date: string) {
  const [year, month] = date.slice(0, 7).split("-");

  return `${year}년 ${Number(month)}월`;
}

function getDay(date: string) {
  return String(Number(date.slice(8, 10)));
}

function getWeekday(date: string) {
  const weekday = new Date(`${date.slice(0, 10)}T00:00:00`).getDay();

  return ["일", "월", "화", "수", "목", "금", "토"][weekday];
}
