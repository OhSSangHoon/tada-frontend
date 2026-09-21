"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface SidePanelItem {
  id: string;
  label: string;
  icon: ReactNode;
  renderContent: (isOpen: boolean) => ReactNode;
}

interface SidePanelRailProps {
  items: SidePanelItem[];
}

const TAB_SIZE = 60;
const TAB_GAP = 8;
const RAIL_TOP = "6rem";

// 오른쪽 끝에 세로로 쌓이는 사이드 버튼(60x60)과, 각 버튼 높이에서 버튼 자리를 덮으며 열리는 패널(440x560)의 공통 규격
export function SidePanelRail({ items }: SidePanelRailProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openId]);

  return (
    <>
      {openId && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenId(null)} />
      )}

      <div className="fixed right-0 top-24 z-[35] flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenId(item.id)}
            aria-label={`${item.label} 열기`}
            title={item.label}
            className="flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-l-2xl bg-[#40312E] text-[#FFEDD5] shadow-lg"
          >
            {item.icon}
          </button>
        ))}
      </div>

      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const offset = index * (TAB_SIZE + TAB_GAP);

        return (
          <aside
            key={item.id}
            inert={!isOpen}
            aria-label={item.label}
            style={{
              top: `calc(${RAIL_TOP} + ${offset}px)`,
              maxHeight: `calc(100vh - ${RAIL_TOP} - ${offset}px - 1rem)`,
            }}
            className={`fixed right-0 z-40 flex h-[560px] w-[440px] flex-col bg-white transition-all duration-300 ${
              isOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-full opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="닫기"
              className="absolute right-6 top-[26px] z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            {item.renderContent(isOpen)}
          </aside>
        );
      })}
    </>
  );
}
