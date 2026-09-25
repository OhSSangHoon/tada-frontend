"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useCorrectPerson } from "@/domains/curator/hooks/useCorrectPerson";
import { usePersons } from "@/domains/curator/hooks/usePersons";
import type {
  PersonTimelineCandidateResponse,
  PersonTimelineItemResponse,
} from "@/domains/curator/types/curator";

interface PersonCorrectionModalProps {
  currentPersonId: string;
  currentPersonName: string;
  item: PersonTimelineItemResponse;
  onPendingChange: (isPending: boolean) => void;
  onCorrected: () => void;
  onClose: () => void;
}

type CorrectionMode = "EXISTING" | "NEW";

export function PersonCorrectionModal({
  currentPersonId,
  currentPersonName,
  item,
  onPendingChange,
  onCorrected,
  onClose,
}: PersonCorrectionModalProps) {
  const initialCandidateId =
    item.personCandidates.length === 1
      ? (item.personCandidates[0]?.id ?? null)
      : null;

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    initialCandidateId,
  );
  const [mode, setMode] = useState<CorrectionMode>("EXISTING");
  const [targetPersonId, setTargetPersonId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPersonListScrolling, setIsPersonListScrolling] = useState(false);

  const personListScrollTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { data: persons = [], isLoading: isPersonsLoading } = usePersons(true);

  const {
    mutateAsync: correctPerson,
    isPending,
    error,
    reset,
  } = useCorrectPerson();

  useEffect(() => {
    onPendingChange(isPending);

    return () => {
      onPendingChange(false);
    };
  }, [isPending, onPendingChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (!isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isPending, onClose]);

  useEffect(() => {
    return () => {
      if (personListScrollTimeoutRef.current) {
        clearTimeout(personListScrollTimeoutRef.current);
      }
    };
  }, []);

  const selectablePersons = useMemo(
    () => persons.filter((person) => person.id !== currentPersonId),
    [currentPersonId, persons],
  );

  const selectedCandidate =
    item.personCandidates.find(
      (candidate) => candidate.id === selectedCandidateId,
    ) ?? null;

  function clearError() {
    setValidationError(null);
    reset();
  }

  function handlePersonListScroll() {
    setIsPersonListScrolling(true);

    if (personListScrollTimeoutRef.current) {
      clearTimeout(personListScrollTimeoutRef.current);
    }

    personListScrollTimeoutRef.current = setTimeout(() => {
      setIsPersonListScrolling(false);
    }, 700);
  }

  async function handleSubmit() {
    if (!selectedCandidate) {
      setValidationError("잘못 연결된 표현을 선택해 주세요.");
      return;
    }

    clearError();

    try {
      if (mode === "EXISTING") {
        if (!targetPersonId) {
          setValidationError("연결할 사람을 선택해 주세요.");
          return;
        }

        await correctPerson({
          personId: currentPersonId,
          candidateId: selectedCandidate.id,
          request: {
            targetPersonId,
          },
        });
      } else {
        const trimmedName = newDisplayName.trim();

        if (!trimmedName) {
          setValidationError("새 사람의 이름을 입력해 주세요.");
          return;
        }

        await correctPerson({
          personId: currentPersonId,
          candidateId: selectedCandidate.id,
          request: {
            newDisplayName: trimmedName,
          },
        });
      }

      onCorrected();
      onClose();
    } catch {
      // mutation error는 아래 UI에서 표시한다.
    }
  }

  const correctionErrorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "인물 연결을 수정하지 못했어요."
        : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-6 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[540px] rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#40312E]">
              이 사람 아니에요
            </h3>

            <p className="mt-1 text-[13px] leading-5 text-[#938984]">
              이 일기에서{" "}
              <strong className="font-bold text-[#5F5651]">
                {currentPersonName}
              </strong>
              으로 연결된 표현을 다른 사람으로 수정할 수 있어요.
            </p>
          </div>

          <button
            type="button"
            aria-label="교정 창 닫기"
            disabled={isPending}
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#776D68] transition hover:bg-[#FFF7ED] hover:text-[#F97316] disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <section className="mt-7">
          <p className="text-[13px] font-bold text-[#5F5651]">
            어떤 표현을 수정할까요?
          </p>

          {item.personCandidates.length === 0 ? (
            <div className="mt-3 rounded-xl bg-[#F8F5F3] px-4 py-3 text-[13px] text-[#8E837E]">
              수정할 수 있는 인물 표현이 없어요.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {item.personCandidates.map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedCandidateId === candidate.id}
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    clearError();
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <p className="text-[13px] font-bold text-[#5F5651]">
            누구로 변경할까요?
          </p>

          <div className="mt-3 grid grid-cols-2 rounded-[14px] bg-[#F6F3F1] p-1">
            <ModeButton
              active={mode === "EXISTING"}
              onClick={() => {
                setMode("EXISTING");
                clearError();
              }}
            >
              기존 사람
            </ModeButton>

            <ModeButton
              active={mode === "NEW"}
              onClick={() => {
                setMode("NEW");
                clearError();
              }}
            >
              새 사람
            </ModeButton>
          </div>

          {mode === "EXISTING" ? (
            <div className="mt-4">
              {isPersonsLoading ? (
                <div className="rounded-xl bg-[#F8F5F3] px-4 py-4 text-sm text-[#938984]">
                  사람 목록을 불러오는 중...
                </div>
              ) : selectablePersons.length === 0 ? (
                <div className="rounded-xl bg-[#F8F5F3] px-4 py-4 text-sm text-[#938984]">
                  연결할 수 있는 다른 사람이 없어요. 새 사람으로 만들어 주세요.
                </div>
              ) : (
                <div
                  onScroll={handlePersonListScroll}
                  className={`max-h-[190px] space-y-2 overflow-y-auto pr-1
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    ${
                      isPersonListScrolling
                        ? "[&::-webkit-scrollbar-thumb]:bg-[#A89E98]"
                        : "[&::-webkit-scrollbar-thumb]:bg-transparent"
                    }
                  `}
                >
                  {selectablePersons.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setTargetPersonId(person.id);
                        clearError();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        targetPersonId === person.id
                          ? "border-[#F97316] bg-[#FFF7ED]"
                          : "border-[#EEE6E1] bg-white hover:border-[#F6C9A9]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-[#40312E]">
                          {person.displayName}
                        </p>

                        {person.aliases.length > 0 && (
                          <p className="mt-0.5 truncate text-[11px] text-[#A09792]">
                            {person.aliases.join(", ")}
                          </p>
                        )}
                      </div>

                      <span className="ml-3 shrink-0 text-[11px] font-medium text-[#A09792]">
                        {person.mentionCount}개 기록
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <input
                value={newDisplayName}
                maxLength={50}
                disabled={isPending}
                onChange={(event) => {
                  setNewDisplayName(event.target.value);
                  clearError();
                }}
                placeholder="새 사람의 이름"
                className="h-11 w-full rounded-xl border border-[#E7DDD7] px-3 text-[14px] text-[#40312E] outline-none transition placeholder:text-[#B8B0AC] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 disabled:bg-[#F8F5F3]"
              />

              <p className="mt-2 text-[11px] text-[#A09792]">
                선택한 표현만 새 사람에게 연결돼요.
              </p>
            </div>
          )}
        </section>

        {(validationError || correctionErrorMessage) && (
          <p className="mt-4 text-[12px] font-medium text-red-500">
            {validationError ?? correctionErrorMessage}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-2 border-t border-[#EEE9E6] pt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="h-11 min-w-[72px] rounded-xl bg-[#F5F0ED] px-4 text-[13px] font-bold text-[#746A65] transition hover:bg-[#EEE7E3] disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="button"
            disabled={isPending || item.personCandidates.length === 0}
            onClick={() => void handleSubmit()}
            className="h-11 min-w-[82px] rounded-xl bg-[#F97316] px-4 text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(249,115,22,0.2)] transition hover:bg-[#EA6A0B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "변경 중..." : "변경"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CandidateRowProps {
  candidate: PersonTimelineCandidateResponse;
  selected: boolean;
  onClick: () => void;
}

function CandidateRow({ candidate, selected, onClick }: CandidateRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3.5 text-left transition ${
        selected
          ? "border-[#F97316] bg-[#FFF7ED] shadow-[0_3px_12px_rgba(249,115,22,0.08)]"
          : "border-[#EEE6E1] bg-white hover:border-[#F6C9A9]"
      }`}
    >
      <span className="min-w-0 truncate text-[14px] font-semibold text-[#40312E]">
        “{candidate.rawText}”
      </span>

      {selected && (
        <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-[#F97316]">
          <CheckIcon />
          선택됨
        </span>
      )}
    </button>
  );
}

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  children: string;
}

function ModeButton({ active, onClick, children }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] px-3 py-2.5 text-[13px] font-bold transition ${
        active
          ? "bg-white text-[#F97316] shadow-[0_2px_8px_rgba(64,49,46,0.08)]"
          : "text-[#7E746F] hover:text-[#F97316]"
      }`}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
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
