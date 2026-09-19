"use client";

import { useState } from "react";
import Image from "next/image";
import { useCreateDiary } from "@/domains/diary/hooks/useCreateDiary";
import { useGenerateSticker } from "@/domains/diary/hooks/useGenerateSticker";
import { useGenerateTitle } from "@/domains/diary/hooks/useGenerateTitle";

type Step = "content" | "keyword" | "loading" | "result";

const WEATHER_OPTIONS = ["☀️ 맑음", "☁️ 흐림", "🌧️ 비", "❄️ 눈"];
const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const TITLE_MAX_LENGTH = 20;

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}월 ${d}일 ${WEEKDAY_NAMES[date.getDay()]}요일`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "요청에 실패했습니다.";
}

interface DiaryWriteModalProps {
  initialDate: string;
  onClose: () => void;
}

export function DiaryWriteModal({
  initialDate,
  onClose,
}: DiaryWriteModalProps) {
  const [step, setStep] = useState<Step>("content");
  const [content, setContent] = useState("");
  const [weatherIndex, setWeatherIndex] = useState<number | null>(null);
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [stickerImageUrl, setStickerImageUrl] = useState<string | null>(null);
  const [hasRegenerated, setHasRegenerated] = useState(false);

  const generateTitleMutation = useGenerateTitle();
  const generateStickerMutation = useGenerateSticker();
  const createDiaryMutation = useCreateDiary();

  const weather = weatherIndex === null ? null : WEATHER_OPTIONS[weatherIndex];

  function handleRequestClose() {
    if (content.trim().length > 0) {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  }

  async function handleGenerateTitle() {
    try {
      const result = await generateTitleMutation.mutateAsync(content);
      setTitle(result.title);
      setKeywords(result.keywords);
      setStep("keyword");
    } catch (error) {
      alert(errorMessage(error));
    }
  }

  async function handleSelectKeyword(keyword: string) {
    setSelectedKeyword(keyword);
    setStep("loading");
    try {
      const result = await generateStickerMutation.mutateAsync({ keyword });
      setStickerImageUrl(result.imageUrl);
      setStep("result");
    } catch (error) {
      alert(errorMessage(error));
      setStep("keyword");
    }
  }

  async function handleRegenerate() {
    if (hasRegenerated || !selectedKeyword) return;
    setHasRegenerated(true);
    setStep("loading");
    try {
      const result = await generateStickerMutation.mutateAsync({
        keyword: selectedKeyword,
        excludeImageUrl: stickerImageUrl ?? undefined,
      });
      setStickerImageUrl(result.imageUrl);
      setStep("result");
    } catch (error) {
      alert(errorMessage(error));
      setStep("result");
    }
  }

  async function handleConfirmSave() {
    if (!selectedKeyword || !stickerImageUrl) return;
    try {
      await createDiaryMutation.mutateAsync({
        entryDate: initialDate,
        title,
        weather,
        content,
        imageUrl: stickerImageUrl,
        keyword: selectedKeyword,
        type: "EXTRACTED",
        extractionResult: { persons: [], places: [], activities: [] },
      });
      onClose();
    } catch (error) {
      alert(errorMessage(error));
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleRequestClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl w-[520px] p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleRequestClose}
          className="absolute top-6 right-6 text-[#F97316] text-2xl leading-none cursor-pointer"
          aria-label="닫기"
        >
          ×
        </button>

        {step === "content" && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span className="bg-[#F97316] text-white rounded-full px-5 py-2 text-sm font-medium">
                {formatDisplayDate(initialDate)}
              </span>
              <div className="relative inline-block">
                <button
                  onClick={() => setShowWeatherPicker((v) => !v)}
                  className="w-28 text-center whitespace-nowrap text-sm border rounded-full px-3 py-2 cursor-pointer"
                >
                  {weather ?? "날씨 선택"}
                </button>
                {showWeatherPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-lg p-2 z-10 flex flex-col gap-1 w-36">
                    <button
                      onClick={() => {
                        setWeatherIndex(null);
                        setShowWeatherPicker(false);
                      }}
                      className="text-left text-sm text-gray-400 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      선택 안함
                    </button>
                    {WEATHER_OPTIONS.map((w, i) => (
                      <button
                        key={w}
                        onClick={() => {
                          setWeatherIndex(i);
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
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 하루는 어땠나요?"
              className="w-full h-64 border rounded-2xl p-4 text-sm resize-none mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={handleGenerateTitle}
                disabled={
                  content.trim().length === 0 || generateTitleMutation.isPending
                }
                className="flex-1 bg-[#F97316] text-white rounded-full py-3 font-medium disabled:opacity-40 cursor-pointer"
              >
                생성
              </button>
              <button
                onClick={handleRequestClose}
                className="flex-1 bg-[#FFEDD5] text-[#F97316] rounded-full py-3 font-medium cursor-pointer"
              >
                취소
              </button>
            </div>
          </>
        )}

        {step === "keyword" && (
          <>
            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))
              }
              maxLength={TITLE_MAX_LENGTH}
              className="w-full border rounded-xl text-center text-[#F97316] font-semibold text-lg py-3 mb-4"
            />
            <p className="text-center text-sm text-gray-600 mb-6">
              스티커로 만들고 싶은 키워드를 선택해주세요.
            </p>
            <div className="flex gap-3 justify-center">
              {keywords.map((k) => (
                <button
                  key={k}
                  onClick={() => handleSelectKeyword(k)}
                  className="bg-[#F97316] text-white rounded-full px-5 py-3 font-medium cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center py-10">
            <div className="w-16 h-16 border-4 border-[#FFEDD5] border-t-[#F97316] rounded-full animate-spin mb-6" />
            <p className="text-[#F97316] font-semibold text-lg mb-1">
              스티커를 그리고 있어요
            </p>
            <p className="text-sm text-gray-500">
              오늘 일기를 읽고 어울리는 스티커를 만드는 중이에요
            </p>
          </div>
        )}

        {step === "result" && stickerImageUrl && (
          <div className="flex flex-col items-center py-4">
            <Image
              src={stickerImageUrl}
              alt={selectedKeyword ?? ""}
              width={112}
              height={112}
              className="object-contain mb-4"
            />
            <p className="text-[#F97316] font-semibold text-lg mb-6">{title}</p>
            {!hasRegenerated && (
              <button
                onClick={handleRegenerate}
                className="text-sm text-gray-400 underline mb-4 cursor-pointer"
              >
                다시 생성하기
              </button>
            )}
            <button
              onClick={handleConfirmSave}
              disabled={createDiaryMutation.isPending}
              className="w-full bg-[#F97316] text-white rounded-full py-3 font-medium disabled:opacity-40 cursor-pointer"
            >
              확인
            </button>
          </div>
        )}

        {showCloseConfirm && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-8">
            <p className="text-center text-sm text-gray-700 mb-6">
              지금 취소하면 작성하고 있던 일기가 초기화됩니다.
              <br />
              정말 취소하시겠습니까?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 bg-red-500 text-white rounded-full py-3 font-medium cursor-pointer"
              >
                예
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
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
