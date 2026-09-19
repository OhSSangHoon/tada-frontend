"use client";

import { useState } from "react";
import Image from "next/image";
import { useCalendar } from "@/domains/calendar/hooks/useCalendar";
import { useCanCreate } from "@/domains/diary/hooks/useCanCreate";
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
const YEAR_RANGE = 20;

export function CalendarSection() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isLoading, isError, isFetching } = useCalendar(year, month);
  const canCreateMutation = useCanCreate();
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

  const itemsByDate = new Map(
    data?.map((item) => [item.entryDate, item]) ?? [],
  );

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl p-8 w-[820px] h-[920px] mx-auto flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-white shadow-xl p-8 w-[820px] h-[920px] mx-auto flex items-center justify-center text-sm text-gray-500">
        불러오기 실패
      </div>
    );
  }

  const selectClassName =
    "w-[145px] h-[50px] rounded-lg bg-[#E6E6E6] border-none appearance-none bg-no-repeat bg-[right_16px_center] pl-5 pr-9 cursor-pointer";
  const selectArrowStyle = {
    fontFamily: "var(--font-google-sans-flex), sans-serif",
    fontWeight: 600,
    fontSize: "20px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23A6A6A6' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  };

  return (
    <>
      <div className="bg-white shadow-xl p-8 w-[820px] h-[920px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <span
            className="text-[#F97316] leading-none"
            style={{
              fontFamily: "var(--font-sebang-gothic), sans-serif",
              fontWeight: 700,
              fontSize: "128px",
            }}
          >
            {String(month).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="w-5 h-5 border-2 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin mr-1" />
            )}
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={selectClassName}
              style={selectArrowStyle}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={selectClassName}
              style={selectArrowStyle}
            >
              {Array.from(
                { length: YEAR_RANGE * 2 + 1 },
                (_, i) => CURRENT_YEAR - YEAR_RANGE + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
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
                    className="object-contain p-2.5"
                  />
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>
      </div>
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
