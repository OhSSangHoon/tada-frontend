"use client";

interface MonthNumberProps {
  month: number;
  direction: "up" | "down";
}

// 숫자가 바뀔 때 위/아래로 슬라이드하며 들어오는 애니메이션 (다음 달=아래서 위로, 이전 달=위에서 아래로)
const keyframes = `
@keyframes month-number-slide-up { from { transform: translateY(40%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes month-number-slide-down { from { transform: translateY(-40%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
`;

export function MonthNumber({ month, direction }: MonthNumberProps) {
  return (
    <div className="relative h-[128px] w-[220px] overflow-hidden">
      <style>{keyframes}</style>
      <span
        key={month}
        className="absolute inset-0 flex items-center text-[#F97316] leading-none"
        style={{
          fontFamily: "var(--font-sebang-gothic), sans-serif",
          fontWeight: 700,
          fontSize: "128px",
          animation: `${direction === "up" ? "month-number-slide-up" : "month-number-slide-down"} 220ms ease-out`,
        }}
      >
        {String(month).padStart(2, "0")}
      </span>
    </div>
  );
}
