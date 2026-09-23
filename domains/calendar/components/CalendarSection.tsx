"use client";

import { useState, type DragEvent } from "react";
import Image from "next/image";
import { useCalendar } from "@/domains/calendar/hooks/useCalendar";
import { useCanCreate } from "@/domains/diary/hooks/useCanCreate";
import { useTrashDiary } from "@/domains/diary/hooks/useTrashDiary";
import { TrashDropZone } from "@/domains/calendar/components/TrashDropZone";
import { MonthNumber } from "@/domains/calendar/components/MonthNumber";
import { MonthYearPicker } from "@/domains/calendar/components/MonthYearPicker";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DiaryWriteModal } from "@/domains/diary/components/DiaryWriteModal";
import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";
import type { CalendarResponseItem } from "@/domains/calendar/types/calendar";

type ModalState =
  | { type: "write"; date: string }
  | { type: "detail"; diaryId: string; imageUrl: string }
  | null;

const today = new Date();
const TODAY_STR = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const CURRENT_YEAR = today.getFullYear();
// 2000년부터 21세기 끝까지 — 연도 칸 항목 100여 개는 렌더링 부담이 전혀 없는 수준이라 넉넉하게 잡는다
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

// 기본 드래그 이미지는 object-contain을 무시하고 칸 크기로 늘려 그려서, 칸 안에 보이는 비율 그대로 직접 만든다
function setStickerDragImage(e: DragEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.naturalWidth) return;

  const style = getComputedStyle(img);
  const boxWidth =
    img.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  const boxHeight =
    img.clientHeight -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom);
  const scale = Math.min(
    boxWidth / img.naturalWidth,
    boxHeight / img.naturalHeight,
  );
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText = `position:fixed;top:-1000px;left:-1000px;width:${width}px;height:${height}px`;
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  document.body.appendChild(canvas);

  e.dataTransfer.setDragImage(canvas, width / 2, height / 2);
  setTimeout(() => canvas.remove(), 0);
}

export function CalendarSection() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [monthDirection, setMonthDirection] = useState<"up" | "down">("up");
  const [modal, setModal] = useState<ModalState>(null);
  const [draggingDiaryId, setDraggingDiaryId] = useState<string | null>(null);
  const [trashTargetId, setTrashTargetId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const { data, isLoading, isError, isFetching } = useCalendar(year, month);
  const canCreateMutation = useCanCreate();
  const trashDiaryMutation = useTrashDiary();
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const pendingDate = canCreateMutation.isPending
    ? canCreateMutation.variables
    : undefined;

  async function handleDayClick(
    dateStr: string,
    item: CalendarResponseItem | undefined,
    isFuture: boolean,
  ) {
    if (item) {
      setModal({
        type: "detail",
        diaryId: item.diaryId,
        imageUrl: item.imageUrl,
      });
      return;
    }

    if (isFuture) return;

    const result = await canCreateMutation.mutateAsync(dateStr);
    if (!result.canCreate) {
      alert(result.reason);
      return;
    }

    setModal({ type: "write", date: dateStr });
  }

  // 12월에서 더 가면 다음 해 1월로, 1월에서 더 오면 전 해 12월로 자연스럽게 넘어간다
  function stepMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    if (nextYear < MIN_YEAR || nextYear > MAX_YEAR) return;
    setMonthDirection(delta > 0 ? "up" : "down");
    setMonth(nextMonth);
    setYear(nextYear);
  }

  function handlePickerConfirm(nextYear: number, nextMonth: number) {
    const wasLater = nextYear * 12 + nextMonth >= year * 12 + month;
    setMonthDirection(wasLater ? "up" : "down");
    setYear(nextYear);
    setMonth(nextMonth);
    setShowPicker(false);
  }

  const isAtMinDate = year === MIN_YEAR && month === 1;
  const isAtMaxDate = year === MAX_YEAR && month === 12;

  async function handleConfirmTrash() {
    if (!trashTargetId) return;
    try {
      await trashDiaryMutation.mutateAsync(trashTargetId);
      setTrashTargetId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    }
  }

  const itemsByDate = new Map(
    data?.map((item) => [item.entryDate, item]) ?? [],
  );

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl p-8 w-205 h-230 mx-auto flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-white shadow-xl p-8 w-205 h-230 mx-auto flex items-center justify-center text-sm text-gray-500">
        불러오기 실패
      </div>
    );
  }

  const selectClassName =
    "w-[168px] h-[50px] rounded-lg bg-[#F5F5F4] text-[#40312E] border-none appearance-none bg-no-repeat bg-[right_16px_center] pl-5 pr-9 cursor-pointer";
  const selectArrowStyle = {
    fontFamily: "var(--font-google-sans-flex), sans-serif",
    fontWeight: 600,
    fontSize: "18px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23A6A6A6' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  };
  const stepArrowClassName =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-[#40312E] hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <>
      <div className="relative bg-white shadow-xl p-8 w-205 h-230 mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <MonthNumber month={month} direction={monthDirection} />
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="w-5 h-5 border-2 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin mr-1" />
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className={selectClassName}
                style={selectArrowStyle}
              >
                {year}년 {String(month).padStart(2, "0")}월
              </button>
              {showPicker && (
                <MonthYearPicker
                  year={year}
                  month={month}
                  minYear={MIN_YEAR}
                  maxYear={MAX_YEAR}
                  onCancel={() => setShowPicker(false)}
                  onConfirm={handlePickerConfirm}
                />
              )}
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => stepMonth(-1)}
                disabled={isAtMinDate}
                aria-label="이전 달"
                className={stepArrowClassName}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => stepMonth(1)}
                disabled={isAtMaxDate}
                aria-label="다음 달"
                className={stepArrowClassName}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        <div
          className="grid grid-cols-7 text-center text-[#40312E] mb-3"
          style={{
            fontFamily: "var(--font-kyobo-handwriting), sans-serif",
            fontSize: "24px",
          }}
        >
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const item = itemsByDate.get(dateStr);
            const isFuture = !item && dateStr > TODAY_STR;
            const isChecking = pendingDate === dateStr;

            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr, item, isFuture)}
                className={`border border-gray-300 aspect-square flex items-center justify-center relative transition-colors ${
                  isFuture
                    ? "text-gray-300 cursor-default"
                    : "text-[#40312E] cursor-pointer hover:bg-[#FFEDD5]"
                }`}
                style={{
                  fontFamily: "var(--font-kyobo-handwriting), sans-serif",
                  fontSize: "24px",
                }}
              >
                {isChecking ? (
                  <div className="w-6 h-6 border-2 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin" />
                ) : item ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.keyword}
                    fill
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", item.diaryId);
                      setStickerDragImage(e);
                      // 드래그 시작 직후에 상태를 바꿔야 브라우저가 드래그를 중단하지 않음
                      setTimeout(() => setDraggingDiaryId(item.diaryId), 0);
                    }}
                    onDragEnd={() => setDraggingDiaryId(null)}
                    className={`object-contain p-2.5 ${
                      draggingDiaryId === item.diaryId ? "opacity-40" : ""
                    }`}
                  />
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>
        {draggingDiaryId && (
          <TrashDropZone
            onDropDiary={() => {
              setTrashTargetId(draggingDiaryId);
              setDraggingDiaryId(null);
            }}
          />
        )}
      </div>
      {trashTargetId && (
        <ConfirmModal
          message={
            <>
              이 일기를 삭제하면 휴지통으로 이동합니다.
              <br />
              정말 삭제하시겠습니까?
            </>
          }
          confirmLabel="예"
          cancelLabel="아니오"
          isPending={trashDiaryMutation.isPending}
          onConfirm={handleConfirmTrash}
          onCancel={() => setTrashTargetId(null)}
        />
      )}
      {modal?.type === "write" && (
        <DiaryWriteModal
          initialDate={modal.date}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "detail" && (
        <DiaryDetailModal
          diaryId={modal.diaryId}
          imageUrl={modal.imageUrl}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
