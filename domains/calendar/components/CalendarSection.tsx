"use client";

import { useState } from "react";
import { useCalendar } from "@/domains/calendar/hooks/useCalendar";
import { useCanCreate } from "@/domains/diary/hooks/useCanCreate";
import { DiaryWriteModal } from "@/domains/diary/components/DiaryWriteModal";
import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";
import type { CalendarItem } from "@/domains/calendar/types/calendar";

type ModalState =
    | { type: "write"; date: string }
    | { type: "detail"; diaryId: string; imageUrl: string }
    | null;

export function CalendarSection() {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(9);
    const [modal, setModal] = useState<ModalState>(null);

    const { data, isLoading, isError } = useCalendar(year, month);
    const canCreateMutation = useCanCreate();
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    async function handleDayClick(dateStr: string, item: CalendarItem | undefined) {
        if (item) {
            setModal({ type: "detail", diaryId: item.diaryId, imageUrl: item.imageUrl });
            return;
        }

        const result = await canCreateMutation.mutateAsync(dateStr);
        if (!result.canCreate) {
            alert(result.reason);
            return;
        }

        setModal({ type: "write", date: dateStr });
    }

    const itemsByDate = new Map(data?.map((item) => [item.entryDate, item]) ?? []);

    if (isLoading) return <div>로딩중...</div>;
    if (isError) return <div>불러오기 실패</div>;

    const selectClassName =
        "w-[145px] h-[50px] rounded-lg bg-[#E6E6E6] border-none appearance-none bg-no-repeat bg-[right_16px_center] pl-5 pr-9 cursor-pointer";
    const selectArrowStyle = {
        fontFamily: "'Google Sans Flex', sans-serif",
        fontWeight: 600,
        fontSize: "20px",
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23A6A6A6' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    };

    return (
    <>
    <link
        href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&display=swap"
        rel="stylesheet"
    />
    <div className="bg-white shadow-xl p-8 w-[820px] h-[920px] mx-auto">
        <div className="flex justify-between items-center mb-6">
            <span
                className="text-[#F97316] leading-none"
                style={{ fontFamily: "'SEBANG Gothic', sans-serif", fontWeight: 700, fontSize: "128px" }}
            >
                {String(month).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className={selectClassName} style={selectArrowStyle}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{m}월</option>
                    ))}
                </select>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className={selectClassName} style={selectArrowStyle}>
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>
            </div>
        </div>
        <div
            className="grid grid-cols-7 text-center text-[#40312E] mb-3"
            style={{ fontFamily: "'Kyobo Handwriting 2025', sans-serif", fontSize: "24px" }}
        >
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <div key={d}>{d}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`}></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const item = itemsByDate.get(dateStr);

                return (
                    <div
                        key={day}
                        onClick={() => handleDayClick(dateStr, item)}
                        className="border border-gray-200 aspect-square flex items-center justify-center text-[#A6A6A6] cursor-pointer hover:bg-gray-50"
                        style={{ fontFamily: "'Kyobo Handwriting 2025', sans-serif", fontSize: "24px" }}
                    >
                        {item ? (
                            <img src={item.imageUrl} alt={item.keyword} className="w-full h-full object-contain p-1" />
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