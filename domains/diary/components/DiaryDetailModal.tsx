"use client";

import { useState } from "react";
import { useDiary } from "@/domains/diary/hooks/useDiary";
import { useUpdateDiary } from "@/domains/diary/hooks/useUpdateDiary";
import { useTrashDiary } from "@/domains/diary/hooks/useTrashDiary";

const WEATHER_OPTIONS = ["☀️ 맑음", "☁️ 흐림", "🌧️ 비", "❄️ 눈"];

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "요청에 실패했습니다.";
}

interface DiaryDetailModalProps {
    diaryId: string;
    imageUrl: string;
    onClose: () => void;
}

export function DiaryDetailModal({ diaryId, imageUrl, onClose }: DiaryDetailModalProps) {
    const { data, isLoading, isError } = useDiary(diaryId);
    const updateDiaryMutation = useUpdateDiary(diaryId);
    const trashDiaryMutation = useTrashDiary();

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [weather, setWeather] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [showWeatherPicker, setShowWeatherPicker] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    function startEditing() {
        if (!data) return;
        setTitle(data.title);
        setWeather(data.weather);
        setContent(data.content);
        setIsEditing(true);
    }

    async function handleSave() {
        try {
            await updateDiaryMutation.mutateAsync({ title, weather, content });
            setIsEditing(false);
        } catch (error) {
            alert(errorMessage(error));
        }
    }

    async function handleConfirmDelete() {
        try {
            await trashDiaryMutation.mutateAsync(diaryId);
            onClose();
        } catch (error) {
            alert(errorMessage(error));
            setShowDeleteConfirm(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-xl w-[520px] p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[#F97316] text-2xl leading-none cursor-pointer"
                    aria-label="닫기"
                >
                    ×
                </button>

                {isLoading && <p className="text-center py-10 text-sm text-gray-500">불러오는 중...</p>}
                {isError && <p className="text-center py-10 text-sm text-gray-500">불러오기 실패</p>}

                {data && (
                    <div className="flex flex-col items-center">
                        <img src={imageUrl} alt={data.title} className="w-24 h-24 mb-3" />
                        <p className="text-[#F97316] font-semibold text-lg mb-4">{data.title}</p>

                        {!isEditing && (
                            <>
                                <div className="flex gap-2 mb-4">
                                    <span className="bg-[#F97316] text-white rounded-full px-4 py-2 text-sm">
                                        {data.entryDate}
                                    </span>
                                    {data.weather && (
                                        <span className="bg-gray-200 text-gray-700 rounded-full px-4 py-2 text-sm">
                                            {data.weather}
                                        </span>
                                    )}
                                </div>
                                <div className="w-full border rounded-2xl p-4 text-sm mb-6 max-h-56 overflow-y-auto whitespace-pre-wrap">
                                    {data.content}
                                </div>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={startEditing}
                                        className="flex-1 bg-[#F97316] text-white rounded-full py-3 font-medium cursor-pointer"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex-1 bg-[#FFEDD5] text-[#F97316] rounded-full py-3 font-medium cursor-pointer"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </>
                        )}

                        {isEditing && (
                            <div className="w-full">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                                    maxLength={20}
                                    className="w-full border rounded-xl text-center font-medium py-2 mb-3"
                                />
                                <div className="relative inline-block mb-3">
                                    <button
                                        onClick={() => setShowWeatherPicker((v) => !v)}
                                        className="text-sm border rounded-full px-3 py-1 cursor-pointer"
                                    >
                                        {weather ?? "날씨 선택 안함"}
                                    </button>
                                    {showWeatherPicker && (
                                        <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-lg p-2 z-10 flex flex-col gap-1 w-36">
                                            <button
                                                onClick={() => {
                                                    setWeather(null);
                                                    setShowWeatherPicker(false);
                                                }}
                                                className="text-left text-sm text-gray-400 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                                            >
                                                설정 안함
                                            </button>
                                            {WEATHER_OPTIONS.map((w) => (
                                                <button
                                                    key={w}
                                                    onClick={() => {
                                                        setWeather(w);
                                                        setShowWeatherPicker(false);
                                                    }}
                                                    className="text-left text-sm px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {w}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-48 border rounded-2xl p-4 text-sm resize-none mb-6"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={updateDiaryMutation.isPending}
                                        className="flex-1 bg-[#F97316] text-white rounded-full py-3 font-medium disabled:opacity-40 cursor-pointer"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-[#FFEDD5] text-[#F97316] rounded-full py-3 font-medium cursor-pointer"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-8">
                        <p className="text-center text-sm text-gray-700 mb-6">
                            이 일기를 삭제하면 휴지통으로 이동합니다.
                            <br />
                            정말 삭제하시겠습니까?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleConfirmDelete}
                                disabled={trashDiaryMutation.isPending}
                                className="flex-1 bg-red-500 text-white rounded-full py-3 font-medium disabled:opacity-40 cursor-pointer"
                            >
                                예
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-[#FFEDD5] text-[#F97316] rounded-full py-3 font-medium cursor-pointer"
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
