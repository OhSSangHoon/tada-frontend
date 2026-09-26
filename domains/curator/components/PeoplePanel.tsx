"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { PersonCard } from "@/domains/curator/components/PersonCard";
import { PersonDetailModal } from "@/domains/curator/components/PersonDetailModal";
import { usePersons } from "@/domains/curator/hooks/usePersons";
import { SidePanelHeader } from "@/shared/components/side-panel/SidePanelParts";

interface PeoplePanelProps {
  isOpen: boolean;
}

export function PeoplePanel({ isOpen }: PeoplePanelProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: persons = [],
    isLoading,
    isError,
    refetch,
  } = usePersons(isOpen);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !isSearchOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setIsSearchOpen(false);
      setQuery("");
    }

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [isOpen, isSearchOpen]);

  const filteredPersons = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return persons;
    }

    return persons.filter((person) =>
      person.displayName.toLowerCase().includes(keyword),
    );
  }, [persons, query]);

  function handleScroll() {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  }

  return (
    <>
      <div className="relative shrink-0 bg-white">
        <SidePanelHeader
          title="내 일기 속 사람들"
          badge={persons.length}
          description="일기에 남은 사람들과 함께한 순간을 모아봤어요."
        />

        {!isSearchOpen && (
          <button
            type="button"
            aria-label="사람 검색"
            title="사람 검색"
            onClick={() => setIsSearchOpen(true)}
            className="absolute right-14 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#776D68] transition hover:bg-[#FFF7ED] hover:text-[#F97316]"
          >
            <SearchIcon />
          </button>
        )}

        {isSearchOpen && (
          <div className="flex items-center gap-2 px-6 pb-4">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#EDE8E5] bg-white px-3 focus-within:border-[#F3BE98] focus-within:ring-2 focus-within:ring-[#F97316]/10">
              <SearchIcon className="h-4 w-4 shrink-0 text-[#F97316]" />

              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름 검색"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#40312E] outline-none placeholder:text-[#B6ADA8]"
              />
            </div>

            <IconButton
              label="검색 닫기"
              onClick={() => {
                setIsSearchOpen(false);
                setQuery("");
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        )}
      </div>

      <div
        onScroll={handleScroll}
        className={`
          min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-1
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
        {isLoading ? (
          <PeopleSkeleton />
        ) : isError ? (
          <PanelMessage
            title="불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            actionLabel="재시도"
            onAction={() => void refetch()}
          />
        ) : persons.length === 0 ? (
          <PanelMessage
            title="아직 기록 속 사람이 없어요"
            description="일기를 쓰면 함께한 사람을 모아드려요."
          />
        ) : filteredPersons.length === 0 ? (
          <PanelMessage
            title="찾는 사람이 없어요"
            description="다른 이름으로 검색해 보세요."
          />
        ) : (
          <div className="space-y-2.5">
            {filteredPersons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => setSelectedPersonId(person.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPersonId && (
        <PersonDetailModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}
    </>
  );
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#776D68] transition hover:bg-[#FFF7ED] hover:text-[#F97316]"
    >
      {children}
    </button>
  );
}

interface SearchIconProps {
  className?: string;
}

function SearchIcon({ className = "h-5 w-5" }: SearchIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function PeopleSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex h-[106px] animate-pulse items-center gap-3 rounded-[17px] border border-[#F0ECE9] px-3"
        >
          <div className="h-[80px] w-[80px] rounded-[18px] bg-[#F5F0ED]" />

          <div className="flex-1">
            <div className="h-4 w-20 rounded bg-[#EEE9E6]" />
            <div className="mt-3 h-5 w-36 rounded bg-[#F5F0ED]" />
          </div>

          <div className="h-4 w-4 rounded bg-[#EEE9E6]" />
        </div>
      ))}
    </div>
  );
}

interface PanelMessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function PanelMessage({
  title,
  description,
  actionLabel,
  onAction,
}: PanelMessageProps) {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF7ED] text-[#F97316]">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20c.7-3.7 2.7-5.5 6-5.5s5.3 1.8 6 5.5" />
        </svg>
      </div>

      <p className="mt-4 text-[15px] font-semibold text-[#40312E]">{title}</p>

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
