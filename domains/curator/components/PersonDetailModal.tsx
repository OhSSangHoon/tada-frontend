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
import { PersonRecordTab } from "@/domains/curator/components/PersonRecordTab";
import { usePersonDetail } from "@/domains/curator/hooks/usePersonDetail";
import { useRenamePerson } from "@/domains/curator/hooks/useRenamePerson";
import type { PersonTimelineItemResponse } from "@/domains/curator/types/curator";
import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";

const FALLBACK_STICKER_IMAGE = "/stickers/goodday.png";

interface PersonDetailModalProps {
  personId: string;
  onClose: () => void;
}

export function PersonDetailModal({
  personId,
  onClose,
}: PersonDetailModalProps) {
  const [isScrolling, setIsScrolling] = useState(false);

  const [selectedDiary, setSelectedDiary] =
    useState<PersonTimelineItemResponse | null>(null);

  const [correctionItem, setCorrectionItem] =
    useState<PersonTimelineItemResponse | null>(null);

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
    refetch,
  } = usePersonDetail(personId);

  const {
    mutateAsync: renamePerson,
    isPending: isRenaming,
    error: renameError,
    reset: resetRename,
  } = useRenamePerson(personId);

  const cancelNameEdit = useCallback(() => {
    setIsEditingName(false);
    setNameValidationError(null);
    resetRename();

    if (person) {
      setNameDraft(person.displayName);
    }
  }, [person, resetRename]);

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
        setCorrectionItem(null);
        return;
      }

      if (selectedDiary) {
        setSelectedDiary(null);
        return;
      }

      if (isEditingName) {
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
    isEditingName,
    onClose,
    selectedDiary,
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
      // mutation error는 아래 UI에서 표시한다.
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
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
          {isLoading ? (
            <DetailSkeleton />
          ) : isError || !person ? (
            <DetailError onClose={onClose} onRetry={() => void refetch()} />
          ) : (
            <>
              <header className="shrink-0 border-b border-[#F1ECE8] px-7 pb-6 pt-7">
                <div className="flex items-start gap-5">
                  <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[28px] bg-[#FFF7ED] ring-1 ring-[#F2E2D8]">
                    {person.stickerUrl ? (
                      <Image
                        src={person.stickerUrl}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : (
                      <PersonPlaceholder />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
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
                                className="min-w-0 flex-1 rounded-xl border border-[#E7DDD7] bg-white px-3 py-2 text-[22px] font-bold tracking-[-0.02em] text-[#40312E] outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 disabled:bg-[#F8F5F3]"
                              />

                              <button
                                type="submit"
                                disabled={isRenaming}
                                className="shrink-0 rounded-xl bg-[#F97316] px-3 py-2 text-[12px] font-bold text-white transition hover:bg-[#EA6A0B] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isRenaming ? "저장 중" : "저장"}
                              </button>

                              <button
                                type="button"
                                disabled={isRenaming}
                                onClick={cancelNameEdit}
                                className="shrink-0 rounded-xl bg-[#F5F0ED] px-3 py-2 text-[12px] font-bold text-[#746A65] transition hover:bg-[#EEE7E3] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                취소
                              </button>
                            </div>

                            {(nameValidationError || renameErrorMessage) && (
                              <p className="mt-2 text-[12px] font-medium text-red-500">
                                {nameValidationError ?? renameErrorMessage}
                              </p>
                            )}
                          </form>
                        ) : (
                          <div className="flex min-w-0 items-center gap-2">
                            <h2 className="truncate text-[26px] font-bold tracking-[-0.02em] text-[#40312E]">
                              {person.displayName}
                              {getWaGwa(person.displayName)}의 기록
                            </h2>

                            <button
                              type="button"
                              onClick={beginNameEdit}
                              aria-label={`${person.displayName} 이름 수정`}
                              title="이름 수정"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#A09792] transition hover:bg-[#FFF3E8] hover:text-[#F97316]"
                            >
                              <EditIcon />
                            </button>
                          </div>
                        )}

                        <p className="mt-1 text-[13px] text-[#978D88]">
                          일기에 남은 {person.displayName}
                          {getWaGwa(person.displayName)} 함께한 순간들을
                          모아봤어요.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="사람 상세 닫기"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#776D68] transition hover:bg-[#FFF7ED] hover:text-[#F97316]"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#857B76]">
                      <StatText
                        label="함께한 기록"
                        value={`${person.mentionCount}개`}
                      />

                      <StatText
                        label="첫 기록"
                        value={formatNullableDate(person.firstMentionedAt)}
                      />

                      <StatText
                        label="최근 기록"
                        value={formatNullableDate(person.lastMentionedAt)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-5">
                  <KeywordSection
                    title="함께한 장소"
                    icon={<LocationIcon />}
                    items={person.topPlaces}
                  />

                  <KeywordSection
                    title="함께한 활동"
                    icon={<ActivityIcon />}
                    items={person.topActivities}
                  />
                </div>
              </header>

              <nav
                aria-label="사람 상세 탭"
                className="shrink-0 border-b border-[#F1ECE8] px-7"
              >
                <div className="flex gap-8">
                  <button
                    type="button"
                    className="border-b-[3px] border-[#F97316] px-1 py-4 text-[14px] font-bold text-[#F97316]"
                  >
                    기록
                  </button>

                  <button
                    type="button"
                    disabled
                    title="다음 단계에서 연결됩니다."
                    className="cursor-not-allowed border-b-[3px] border-transparent px-1 py-4 text-[14px] font-semibold text-[#B8B0AC]"
                  >
                    추억
                  </button>
                </div>
              </nav>

              <div
                onScroll={handleScroll}
                className={`min-h-0 flex-1 overflow-auto px-7 py-6
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  ${isScrolling
                    ? "[&::-webkit-scrollbar-thumb]:bg-[#A89E98]"
                    : "[&::-webkit-scrollbar-thumb]:bg-transparent"
                  }
                `}
              >
                <PersonRecordTab
                  personId={personId}
                  onDiaryOpen={setSelectedDiary}
                  onCorrectionRequest={setCorrectionItem}
                />
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

      {correctionItem && person && (
        <PersonCorrectionModal
          currentPersonId={personId}
          currentPersonName={person.displayName}
          item={correctionItem}
          onClose={() => setCorrectionItem(null)}
        />
      )}
    </>,
    document.body,
  );
}

interface StatTextProps {
  label: string;
  value: string;
}

function StatText({ label, value }: StatTextProps) {
  return (
    <span>
      {label} <strong className="font-bold text-[#40312E]">{value}</strong>
    </span>
  );
}

interface KeywordSectionProps {
  title: string;
  icon: ReactNode;
  items: {
    normalizedText: string;
    diaryCount: number;
  }[];
}

function KeywordSection({ title, icon, items }: KeywordSectionProps) {
  return (
    <section className="rounded-2xl bg-[#FBF8F6] px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-[#F97316]">{icon}</span>

        <p className="text-[12px] font-bold text-[#746A65]">{title}</p>
      </div>

      <div className="mt-3 flex min-h-8 flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-[12px] text-[#B6ADA8]">아직 없어요</span>
        ) : (
          items.slice(0, 3).map((item) => (
            <span
              key={item.normalizedText}
              title={`${item.normalizedText} · ${item.diaryCount}개 기록`}
              className="max-w-[150px] truncate rounded-full border border-[#EFE4DD] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#675E59]"
            >
              {item.normalizedText}
            </span>
          ))
        )}
      </div>
    </section>
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

      <p className="mt-1 text-sm text-[#958B86]">
        잠시 후 다시 시도해 주세요.
      </p>

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
      <path d="M5 12h14M12 5v14" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
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
    <div className="min-h-[650px] animate-pulse">
      <div className="border-b border-[#F1ECE8] px-7 pb-6 pt-7">
        <div className="flex gap-5">
          <div className="h-[88px] w-[88px] rounded-[28px] bg-[#F5F0ED]" />

          <div className="flex-1">
            <div className="h-7 w-48 rounded bg-[#F0EAE6]" />
            <div className="mt-3 h-3 w-60 rounded bg-[#F5F0ED]" />

            <div className="mt-5 flex gap-4">
              <div className="h-4 w-24 rounded bg-[#F5F0ED]" />
              <div className="h-4 w-28 rounded bg-[#F5F0ED]" />
              <div className="h-4 w-28 rounded bg-[#F5F0ED]" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <div className="h-[88px] rounded-2xl bg-[#F8F5F3]" />
          <div className="h-[88px] rounded-2xl bg-[#F8F5F3]" />
        </div>
      </div>

      <div className="border-b border-[#F1ECE8] px-7 py-4">
        <div className="h-5 w-14 rounded bg-[#F0EAE6]" />
      </div>

      <div className="space-y-4 px-7 py-6">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[112px] rounded-2xl bg-[#F8F5F3]" />
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

  const jongseong = (code - 0xac00) % 28;

  return jongseong === 0 ? "와" : "과";
}