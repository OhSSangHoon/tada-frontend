"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { PersonCorrectionModal } from "@/domains/curator/components/PersonCorrectionModal";
import { PersonMemoryTab } from "@/domains/curator/components/PersonMemoryTab";
import { PersonRecordTab } from "@/domains/curator/components/PersonRecordTab";
import { usePersonDetail } from "@/domains/curator/hooks/usePersonDetail";
import { useRenamePerson } from "@/domains/curator/hooks/useRenamePerson";
import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";
import { ApiError } from "@/shared/lib/api-client";

import type {
  PersonMemoryDiaryResponse,
  PersonTimelineItemResponse,
} from "@/domains/curator/types/curator";

const FALLBACK_STICKER_IMAGE = "/stickers/goodday.png";

type PersonDetailTab = "RECORD" | "MEMORY";

interface PersonDetailModalProps {
  personId: string;
  onClose: () => void;
}

export function PersonDetailModal({
  personId,
  onClose,
}: PersonDetailModalProps) {
  const [activeTab, setActiveTab] = useState<PersonDetailTab>("RECORD");
  const [isScrolling, setIsScrolling] = useState(false);

  const [selectedDiary, setSelectedDiary] =
    useState<PersonTimelineItemResponse | null>(null);

  const [selectedMemoryDiary, setSelectedMemoryDiary] =
    useState<PersonMemoryDiaryResponse | null>(null);

  const [correctionItem, setCorrectionItem] =
    useState<PersonTimelineItemResponse | null>(null);
  const [isCorrectionPending, setIsCorrectionPending] = useState(false);
  const [openTimelineMenuDiaryId, setOpenTimelineMenuDiaryId] = useState<
    string | null
  >(null);
  const [closeIfPersonMissing, setCloseIfPersonMissing] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameValidationError, setNameValidationError] = useState<string | null>(
    null,
  );

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: person,
    isLoading,
    isError,
    isFetching,
    error: detailError,
    refetch,
  } = usePersonDetail(personId);

  const {
    mutateAsync: renamePerson,
    isPending: isRenaming,
    error: renameError,
    reset: resetRename,
  } = useRenamePerson(personId);

  const cancelNameEdit = useCallback(() => {
    if (isRenaming) {
      return;
    }

    setIsEditingName(false);
    setNameValidationError(null);
    resetRename();

    if (person) {
      setNameDraft(person.displayName);
    }
  }, [isRenaming, person, resetRename]);

  useEffect(() => {
    if (!closeIfPersonMissing || isFetching) {
      return;
    }

    if (detailError instanceof ApiError && detailError.status === 404) {
      onClose();
      return;
    }

    const timeoutId = setTimeout(() => {
      setCloseIfPersonMissing(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [closeIfPersonMissing, detailError, isFetching, onClose]);

  useEffect(() => {
    if (!isEditingName) {
      return;
    }

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (correctionItem) {
        if (isCorrectionPending) {
          return;
        }

        setCorrectionItem(null);
        return;
      }

      if (selectedMemoryDiary) {
        setSelectedMemoryDiary(null);
        return;
      }

      if (selectedDiary) {
        setSelectedDiary(null);
        return;
      }

      if (openTimelineMenuDiaryId) {
        setOpenTimelineMenuDiaryId(null);
        return;
      }

      if (isEditingName) {
        if (isRenaming) {
          return;
        }

        cancelNameEdit();
        return;
      }

      onClose();
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    cancelNameEdit,
    correctionItem,
    isCorrectionPending,
    isEditingName,
    isRenaming,
    onClose,
    openTimelineMenuDiaryId,
    selectedDiary,
    selectedMemoryDiary,
  ]);

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

  function beginNameEdit() {
    if (!person) {
      return;
    }

    setNameDraft(person.displayName);
    setNameValidationError(null);
    resetRename();
    setIsEditingName(true);
  }

  async function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!person || isRenaming) {
      return;
    }

    const trimmedName = nameDraft.trim();

    if (!trimmedName) {
      setNameValidationError("변경할 이름을 입력해 주세요.");
      return;
    }

    if (trimmedName === person.displayName) {
      cancelNameEdit();
      return;
    }

    setNameValidationError(null);
    resetRename();

    try {
      await renamePerson({
        displayName: trimmedName,
      });

      setIsEditingName(false);
      setNameDraft(trimmedName);
    } catch {
      // mutation error는 UI에서 표시한다.
    }
  }

  const renameErrorMessage =
    renameError instanceof Error
      ? renameError.message
      : renameError
        ? "이름을 변경하지 못했어요."
        : null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isRenaming) {
            onClose();
          }
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          {isLoading ? (
            <DetailSkeleton />
          ) : isError || !person ? (
            <DetailError onClose={onClose} onRetry={() => void refetch()} />
          ) : (
            <>
              <header className="shrink-0 bg-white px-7 pb-5 pt-6">
                <div className="flex items-start gap-5">
                  <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[22px] bg-[#FFF7ED]">
                    {person.stickerUrl ? (
                      <Image
                        src={person.stickerUrl}
                        alt=""
                        fill
                        sizes="100px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <PersonPlaceholder />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        {isEditingName ? (
                          <form
                            onSubmit={(event) => void handleRenameSubmit(event)}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                ref={nameInputRef}
                                value={nameDraft}
                                disabled={isRenaming}
                                maxLength={50}
                                onChange={(event) => {
                                  setNameDraft(event.target.value);

                                  if (nameValidationError) {
                                    setNameValidationError(null);
                                  }

                                  if (renameError) {
                                    resetRename();
                                  }
                                }}
                                aria-label="사람 이름"
                                className="min-w-0 flex-1 rounded-xl border border-[#E7DDD7] bg-white px-3 py-2 text-[22px] font-bold text-[#40312E] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
                              />

                              <button
                                type="submit"
                                disabled={isRenaming}
                                className="rounded-xl bg-[#F97316] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-60"
                              >
                                {isRenaming ? "저장 중" : "저장"}
                              </button>

                              <button
                                type="button"
                                disabled={isRenaming}
                                onClick={cancelNameEdit}
                                className="rounded-xl bg-[#F5F2F0] px-3 py-2 text-[11px] font-bold text-[#746A65] disabled:opacity-60"
                              >
                                취소
                              </button>
                            </div>

                            {(nameValidationError || renameErrorMessage) && (
                              <p className="mt-2 text-[11px] font-medium text-red-500">
                                {nameValidationError ?? renameErrorMessage}
                              </p>
                            )}
                          </form>
                        ) : (
                          <div className="flex min-w-0 items-center gap-2">
                            <h2 className="truncate text-[28px] font-bold tracking-[-0.03em] text-[#40312E]">
                              {person.displayName}
                              {getWaGwa(person.displayName)}의 기록
                            </h2>

                            <button
                              type="button"
                              onClick={beginNameEdit}
                              aria-label={`${person.displayName} 이름 수정`}
                              title="이름 수정"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#9E948F] transition hover:bg-[#FFF3E8] hover:text-[#F97316]"
                            >
                              <EditIcon />
                            </button>
                          </div>
                        )}

                        <p className="mt-1.5 text-[13px] text-[#7E746F]">
                          일기에 남은 {person.displayName}
                          {getWaGwa(person.displayName)} 함께한 순간들을
                          모아봤어요.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="사람 상세 닫기"
                        disabled={isRenaming}
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#776D68] transition hover:bg-[#F8F5F3] hover:text-[#F97316] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div className="mt-5 flex items-center divide-x divide-[#EEE9E6]">
                      <StatItem
                        label="함께한 기록"
                        value={`${person.mentionCount}개`}
                        accent
                      />

                      <StatItem
                        label="첫 기록"
                        value={formatNullableDate(person.firstMentionedAt)}
                      />

                      <StatItem
                        label="최근 기록"
                        value={formatNullableDate(person.lastMentionedAt)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 divide-x divide-[#EEE5DF] rounded-[18px] bg-[#FFFBF8] px-2 py-3">
                  <KeywordStrip
                    title="함께한 장소"
                    icon={<LocationIcon />}
                    items={person.topPlaces}
                  />

                  <KeywordStrip
                    title="함께한 활동"
                    icon={<ActivityIcon />}
                    items={person.topActivities}
                  />
                </div>
              </header>

              <nav className="shrink-0 border-b border-[#EEE9E6] px-7">
                <div className="flex gap-8">
                  <TabButton
                    active={activeTab === "RECORD"}
                    onClick={() => {
                      setOpenTimelineMenuDiaryId(null);
                      setActiveTab("RECORD");
                    }}
                  >
                    기록
                  </TabButton>

                  <TabButton
                    active={activeTab === "MEMORY"}
                    onClick={() => {
                      setOpenTimelineMenuDiaryId(null);
                      setActiveTab("MEMORY");
                    }}
                  >
                    추억
                  </TabButton>
                </div>
              </nav>

              <div
                onScroll={handleScroll}
                className={`
                  min-h-0 flex-1 overflow-y-auto bg-white px-7 py-4
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
                {activeTab === "RECORD" ? (
                  <PersonRecordTab
                    personId={personId}
                    openMenuDiaryId={openTimelineMenuDiaryId}
                    onOpenMenuDiaryIdChange={setOpenTimelineMenuDiaryId}
                    onDiaryOpen={setSelectedDiary}
                    onCorrectionRequest={setCorrectionItem}
                  />
                ) : (
                  <PersonMemoryTab
                    personId={personId}
                    displayName={person.displayName}
                    onDiaryOpen={setSelectedMemoryDiary}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedDiary && (
        <DiaryDetailModal
          diaryId={selectedDiary.diaryId}
          imageUrl={selectedDiary.stickerUrl ?? FALLBACK_STICKER_IMAGE}
          onClose={() => setSelectedDiary(null)}
        />
      )}

      {selectedMemoryDiary && (
        <DiaryDetailModal
          diaryId={selectedMemoryDiary.id}
          imageUrl={selectedMemoryDiary.stickerUrl ?? FALLBACK_STICKER_IMAGE}
          onClose={() => setSelectedMemoryDiary(null)}
        />
      )}

      {correctionItem && person && (
        <PersonCorrectionModal
          currentPersonId={personId}
          currentPersonName={person.displayName}
          item={correctionItem}
          onPendingChange={setIsCorrectionPending}
          onCorrected={() => setCloseIfPersonMissing(true)}
          onClose={() => {
            setIsCorrectionPending(false);
            setCorrectionItem(null);
          }}
        />
      )}
    </>,
    document.body,
  );
}

interface StatItemProps {
  label: string;
  value: string;
  accent?: boolean;
}

function StatItem({ label, value, accent = false }: StatItemProps) {
  return (
    <div className="min-w-0 flex-1 px-4 first:pl-0">
      <p className="text-[11px] font-medium text-[#7E746F]">{label}</p>

      <p
        className={`mt-1 truncate text-[15px] font-bold ${
          accent ? "text-[#F97316]" : "text-[#40312E]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface KeywordStripProps {
  title: string;
  icon: ReactNode;
  items: {
    normalizedText: string;
    diaryCount: number;
  }[];
}

function KeywordStrip({ title, icon, items }: KeywordStripProps) {
  return (
    <section className="flex min-h-[58px] items-center gap-3 px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E4] text-[#F97316]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-[#40312E]">{title}</p>

        <div className="mt-1.5 flex min-w-0 gap-1.5 overflow-hidden">
          {items.length === 0 ? (
            <span className="text-[11px] text-[#8B817C]">아직 없어요</span>
          ) : (
            items.slice(0, 3).map((item) => (
              <span
                key={item.normalizedText}
                title={item.normalizedText}
                className="max-w-[92px] truncate rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#665D58] shadow-[0_1px_4px_rgba(64,49,46,0.05)]"
              >
                {item.normalizedText}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: string;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-[3px] px-1 py-3.5 text-[14px] font-bold transition ${
        active
          ? "border-[#F97316] text-[#F97316]"
          : "border-transparent text-[#9B918C] hover:text-[#F97316]"
      }`}
    >
      {children}
    </button>
  );
}

interface DetailErrorProps {
  onClose: () => void;
  onRetry: () => void;
}

function DetailError({ onClose, onRetry }: DetailErrorProps) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center">
      <p className="font-semibold text-[#40312E]">
        사람 정보를 불러오지 못했어요
      </p>

      <p className="mt-1 text-sm text-[#958B86]">잠시 후 다시 시도해 주세요.</p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-[#F97316] px-4 py-2 text-sm font-semibold text-white"
        >
          재시도
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-[#F5F0ED] px-4 py-2 text-sm font-semibold text-[#6F6560]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function PersonPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[#F97316]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21c.7-4.3 3-6.5 7-6.5s6.3 2.2 7 6.5" />
      </svg>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[16px] w-[16px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
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

function DetailSkeleton() {
  return (
    <div className="min-h-[650px] animate-pulse p-7">
      <div className="flex gap-5">
        <div className="h-[100px] w-[100px] rounded-[22px] bg-[#F5F0ED]" />

        <div className="flex-1">
          <div className="h-7 w-48 rounded bg-[#EEE9E6]" />
          <div className="mt-3 h-3 w-56 rounded bg-[#F5F0ED]" />
          <div className="mt-6 h-10 w-full rounded bg-[#F8F5F3]" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-[62px] rounded-[14px] bg-[#F8F5F3]" />
        <div className="h-[62px] rounded-[14px] bg-[#F8F5F3]" />
      </div>

      <div className="mt-5 h-10 rounded bg-[#F5F0ED]" />

      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-[78px] rounded-xl bg-[#F8F5F3]" />
        ))}
      </div>
    </div>
  );
}

function formatNullableDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return date.slice(0, 10).replaceAll("-", ".");
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
