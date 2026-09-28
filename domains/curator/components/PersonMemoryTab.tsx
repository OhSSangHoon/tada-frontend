"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type UIEvent } from "react";

import { usePersonMemories } from "@/domains/curator/hooks/usePersonMemories";

import type {
  PersonMemoryDiaryResponse,
  PersonMemoryGroupResponse,
} from "@/domains/curator/types/curator";

interface PersonMemoryTabProps {
  personId: string;
  displayName: string;
  onDiaryOpen: (diary: PersonMemoryDiaryResponse) => void;
}

export function PersonMemoryTab({
  personId,
  displayName,
  onDiaryOpen,
}: PersonMemoryTabProps) {
  const {
    data: groups = [],
    isLoading,
    isError,
    refetch,
  } = usePersonMemories(personId);

  if (isLoading) {
    return <MemorySkeleton />;
  }

  if (isError) {
    return (
      <MemoryMessage
        title="추억을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        actionLabel="재시도"
        onAction={() => void refetch()}
      />
    );
  }

  if (groups.length === 0) {
    return (
      <MemoryMessage
        title="아직 모인 추억이 없어요"
        description="같은 장소나 활동의 기록이 3개 이상 쌓이면 추억으로 모아드려요."
      />
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#40312E]">
            함께 쌓인 추억
          </h3>
          <p className="mt-1 text-[12px] text-[#7E746F]">
            장소와 활동으로 이어진 기록을 모았어요.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#FFF0E4] px-3 py-1.5 text-[11px] font-bold text-[#F97316]">
          {groups.length}개의 추억
        </span>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <MemoryGroupCard
            key={`${group.groupType}:${group.groupKey}`}
            group={group}
            displayName={displayName}
            onDiaryOpen={onDiaryOpen}
          />
        ))}
      </div>
    </section>
  );
}

interface MemoryGroupCardProps {
  group: PersonMemoryGroupResponse;
  displayName: string;
  onDiaryOpen: (diary: PersonMemoryDiaryResponse) => void;
}

function MemoryGroupCard({
  group,
  displayName,
  onDiaryOpen,
}: MemoryGroupCardProps) {
  const hasInnerScroll = group.diaries.length > 3;

  const [isScrolling, setIsScrolling] = useState(false);
  const [showMoreIndicator, setShowMoreIndicator] = useState(hasInnerScroll);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;

    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);

    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 2;

    setShowMoreIndicator(!reachedBottom);
  }

  const title =
    group.groupType === "ACTIVITY"
      ? `${displayName}${getWaGwa(displayName)} 함께한 ${group.groupKey}`
      : `${group.groupKey}에서 함께한 날들`;

  return (
    <article
      className="
        overflow-hidden rounded-[20px] border border-[#EEE9E6] bg-white p-5
        transition-[border-color,box-shadow,transform]
        hover:-translate-y-0.5
        hover:border-[#F2BE99]
        hover:shadow-[0_7px_22px_rgba(64,49,46,0.06)]
      "
    >
      <div className="grid grid-cols-[minmax(0,1fr)_142px] items-center gap-5">
        <div className="min-w-0 py-1">
          <span className="inline-flex rounded-full bg-[#FFF0E3] px-2.5 py-1 text-[11px] font-bold text-[#F97316]">
            {group.groupType === "PLACE" ? "함께한 장소" : "함께한 활동"}
          </span>

          <h3 className="mt-2.5 truncate text-[18px] font-bold tracking-[-0.02em] text-[#40312E]">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="font-bold text-[#F97316]">
              {group.diaryCount}개의 기록
            </span>

            <span className="h-3 w-px bg-[#E7E1DE]" />

            <span className="font-medium text-[#7E746F]">
              {formatPeriod(group.firstEntryDate, group.lastEntryDate)}
            </span>
          </div>
        </div>

        <div className="flex min-h-[120px] items-center justify-center rounded-[18px] bg-[#FFF8F2]">
          {group.stickers.length > 0 ? (
            <StickerGroup stickers={group.stickers} />
          ) : (
            <MemoryPlaceholder />
          )}
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden border-t border-[#EEE9E6] pt-1.5">
        <div
          onScroll={hasInnerScroll ? handleScroll : undefined}
          className={`
            ${hasInnerScroll ? "max-h-[108px] overflow-y-auto" : ""}
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            ${
              isScrolling
                ? "[&::-webkit-scrollbar-thumb]:bg-[#AEA49F]"
                : "[&::-webkit-scrollbar-thumb]:bg-transparent"
            }
          `}
        >
          {group.diaries.map((diary) => (
            <button
              key={diary.id}
              type="button"
              onClick={() => onDiaryOpen(diary)}
              className="flex h-10 w-full items-center gap-3 border-b border-[#F3EFED] px-1.5 text-left transition-colors last:border-b-0 hover:bg-[#FFF9F5]"
            >
              <span className="w-[42px] shrink-0 text-[11px] font-bold text-[#F97316]">
                {formatMonthDay(diary.entryDate)}
              </span>

              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#40312E]">
                {diary.title}
              </span>

              <ChevronIcon />
            </button>
          ))}
        </div>

        {hasInnerScroll && showMoreIndicator && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-6 items-end justify-center bg-gradient-to-t from-white via-white/95 to-transparent text-[#F97316]">
            <DownIcon />
          </div>
        )}
      </div>
    </article>
  );
}

interface StickerGroupProps {
  stickers: PersonMemoryGroupResponse["stickers"];
}

function StickerGroup({ stickers }: StickerGroupProps) {
  const visible = stickers.slice(0, 3);

  if (visible.length === 1) {
    return (
      <div className="relative h-[96px] w-[96px]">
        <Image
          src={visible[0].imageUrl}
          alt=""
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative h-[100px] w-[124px]">
      {visible.map((sticker, index) => {
        const position = [
          "left-0 top-2 h-[72px] w-[72px]",
          "right-0 top-0 h-[68px] w-[68px]",
          "left-[32px] bottom-0 h-[58px] w-[58px]",
        ][index];

        return (
          <div
            key={`${sticker.imageUrl}-${index}`}
            title={sticker.keyword}
            className={`absolute ${position}`}
          >
            <div className="relative h-full w-full">
              <Image
                src={sticker.imageUrl}
                alt=""
                fill
                sizes="72px"
                className="object-contain drop-shadow-[0_2px_2px_rgba(64,49,46,0.1)]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MemoryMessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function MemoryMessage({
  title,
  description,
  actionLabel,
  onAction,
}: MemoryMessageProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#FFF7ED] text-[#F97316]">
        <MemoryIcon />
      </div>

      <p className="mt-4 text-[14px] font-semibold text-[#40312E]">{title}</p>

      <p className="mt-1 max-w-[330px] text-[11px] leading-5 text-[#958B86]">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-[#F97316] px-4 py-2 text-[11px] font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function MemorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[228px] animate-pulse rounded-[18px] border border-[#F1E9E4] bg-white"
        />
      ))}
    </div>
  );
}

function MemoryPlaceholder() {
  return (
    <div className="text-[#F97316]">
      <MemoryIcon />
    </div>
  );
}

function MemoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m7 16 3.5-3.5 2.5 2.5 2.5-2.5L20 17" />
      <circle cx="9" cy="9" r="1.3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3 w-3 shrink-0 text-[#AAA09B]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function formatMonthDay(date: string) {
  const parts = date.slice(0, 10).split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[1]}.${parts[2]}`;
}

function formatPeriod(first: string, last: string) {
  return `${formatMonthDay(first)} ~ ${formatMonthDay(last)}`;
}

function getWaGwa(name: string) {
  const lastCharacter = name.at(-1);

  if (!lastCharacter) {
    return "와";
  }

  const code = lastCharacter.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return "와";
  }

  return (code - 0xac00) % 28 === 0 ? "와" : "과";
}
