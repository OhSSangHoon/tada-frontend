"use client";

// 사이드 패널 공통 규격: 3번째 버튼(스티커 앨범) 기준
// top = 96 + (버튼 순서 index 2) × 68 = 232px
const BUTTON_TOP = 232;

interface StickerTriggerButtonProps {
  onClick: () => void;
}

export function StickerTriggerButton({ onClick }: StickerTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="스티커 앨범 열기"
      style={{ top: `${BUTTON_TOP}px` }}
      className="fixed right-0 z-35 flex h-[60px] w-[60px] items-center justify-center rounded-l-[16px] bg-[#40312E] text-[#FFEDD5] cursor-pointer"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    </button>
  );
}
