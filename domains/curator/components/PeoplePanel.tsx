"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PersonCard } from "@/domains/curator/components/PersonCard";
import { PersonDetailModal } from "@/domains/curator/components/PersonDetailModal";
import { usePersons } from "@/domains/curator/hooks/usePersons";
import {
  SidePanelBody,
  SidePanelHeader,
} from "@/shared/components/side-panel/SidePanelParts";

interface PeoplePanelProps {
  isOpen: boolean;
}

export function PeoplePanel({ isOpen }: PeoplePanelProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const {
    data: persons = [],
    isLoading,
    isError,
    refetch,
  } = usePersons(isOpen);

  useEffect(() => {
    if (!isOpen || !isSearchOpen) {
      return;
    }

    function handleSearchEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setIsSearchOpen(false);
      setQuery("");
    }

    document.addEventListener("keydown", handleSearchEscape, true);

    return () => {
      document.removeEventListener("keydown", handleSearchEscape, true);
    };
  }, [isOpen, isSearchOpen]);

  const filteredPersons = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return persons;
    }

    return persons.filter((person) =>
      [person.displayName, ...person.aliases].some((name) =>
        name.toLowerCase().includes(keyword),
      ),
    );
  }, [persons, query]);

  return (
    <>
      <div className="relative shrink-0">
        <SidePanelHeader
          title="내 일기 속 사람들"
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
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#F8F5F3] px-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-[#F97316]" />

              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름 또는 별칭 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#40312E] outline-none placeholder:text-[#B9B0AB]"
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

      <SidePanelBody>
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
          <div className="grid grid-cols-2 gap-3">
            {filteredPersons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => setSelectedPersonId(person.id)}
              />
            ))}
          </div>
        )}
      </SidePanelBody>

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
    <div className="grid grid-cols-2 gap-3" aria-label="사람 목록 불러오는 중">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[176px] animate-pulse flex-col items-center rounded-2xl border border-[#F2ECE8] px-3 py-4"
        >
          <div className="h-[72px] w-[72px] rounded-full bg-[#F5F0ED]" />
          <div className="mt-3 h-4 w-20 rounded bg-[#F0EAE6]" />
          <div className="mt-2 h-3 w-24 rounded bg-[#F5F0ED]" />
          <div className="mt-3 h-3 w-20 rounded bg-[#F5F0ED]" />
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
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF7ED] text-[#F97316]">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20c.7-3.7 2.7-5.5 6-5.5s5.3 1.8 6 5.5" />
        </svg>
      </div>

      <p className="mt-4 text-[16px] font-semibold text-[#40312E]">{title}</p>

      <p className="mt-1 text-[14px] text-[#958B86]">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#EA6A0B]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
