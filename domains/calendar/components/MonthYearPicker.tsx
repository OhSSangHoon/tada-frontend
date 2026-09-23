"use client";

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const CENTER_OFFSET = VIEWPORT_HEIGHT / 2 - ITEM_HEIGHT / 2;
// 마우스 휠 한 "칸"의 일반적인 크기(대략 100~120px)에 맞춘 값. ITEM_HEIGHT로 하면
// 휠 한 번에 2~3칸씩 튀는 문제가 그대로 남는다.
const WHEEL_STEP_PX = 100;
// 이 이상 움직여야 "드래그"로 인정한다. 그 전까지는 포인터 캡처를 아예 걸지 않아서
// 네이티브 클릭이 그대로 살아있다 — 탭(클릭)과 드래그를 좌표 계산 없이 정확하게 구분하는 방법.
const DRAG_ENGAGE_PX = 4;

const keyframes = `
@keyframes date-picker-slide-down { from { opacity: 0; transform: translateY(-8px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// [-half, half) 범위로 감아준다. 월 칸이 12→1, 1→12로 순환하는 것처럼 보이게 하는 핵심 계산.
function wrapDelta(diff: number, period: number) {
  let d = ((diff % period) + period) % period;
  if (d >= period / 2) d -= period;
  return d;
}

interface DragState {
  pointerId: number;
  startY: number;
  startTotal: number;
  engaged: boolean;
  // 연도 칸 자체 드래그 전용 — 그 드래그 동안만 쓰는 연속(소수) 연도 위치
  liveYearPos?: number;
}

interface MonthYearPickerProps {
  year: number;
  month: number; // 1-12
  minYear: number;
  maxYear: number;
  onCancel: () => void;
  onConfirm: (year: number, month: number) => void;
}

// 연도 칸(왼쪽)과 월 칸(오른쪽)을 하나의 total(연도 시작점부터 몇 번째 달인지)로 묶어서 관리한다.
// 월 칸을 12월에서 더 넘기면 total이 그대로 증가하면서 연도 칸도 자동으로 다음 해로 넘어간다
// (반대로 1월에서 더 내리면 전 해로). 두 칸 다 같은 total을 서로 다른 단위(월=1, 연=12)로 보여주는 것뿐이다.
export function MonthYearPicker({
  year,
  month,
  minYear,
  maxYear,
  onCancel,
  onConfirm,
}: MonthYearPickerProps) {
  const minTotal = 0;
  const maxTotal = (maxYear - minYear) * 12 + 11;
  const initialTotal = clamp((year - minYear) * 12 + (month - 1), minTotal, maxTotal);

  // totalRef: 드래그 중 매 프레임 읽고 쓰는 값(이벤트 핸들러 전용).
  // total(state): 렌더에 필요한 값(연도/월 표시, 이동 버튼)은 항상 이 state에서 읽는다.
  const totalRef = useRef(initialTotal);
  const [total, setTotal] = useState(initialTotal);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const yearTrackRef = useRef<HTMLDivElement>(null);
  const yearItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const monthItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const yearDragRef = useRef<DragState | null>(null);
  const monthDragRef = useRef<DragState | null>(null);
  const yearWheelAccum = useRef(0);
  const monthWheelAccum = useRef(0);
  const yearWheelResetTimer = useRef<number | undefined>(undefined);
  const monthWheelResetTimer = useRef<number | undefined>(undefined);

  // pos: 연도 칸 자체의 위치(그 해가 정수, 드래그 중엔 소수). total/12를 그대로 쓰면
  // 같은 해 안에서도 월이 바뀔 때마다 다음 해 쪽으로 조금씩 쏠려 보이는 버그가 생겨서,
  // "몇 번째 달이든 그 해가 확정으로 보이게" 항상 이 값으로만 그린다(연도 칸 자체 드래그 제외).
  function renderYear(pos: number) {
    if (yearTrackRef.current) {
      yearTrackRef.current.style.transform = `translateY(${CENTER_OFFSET - pos * ITEM_HEIGHT}px)`;
    }
    yearItemRefs.current.forEach((el, i) => {
      if (!el) return;
      const distance = Math.abs(i - pos);
      el.style.opacity = String(Math.max(1 - distance * 0.3, 0.35));
      el.style.transform = `scale(${Math.max(1 - distance * 0.1, 0.8)})`;
      el.style.fontWeight = distance < 0.5 ? "700" : "400";
      el.style.color = distance < 0.5 ? "#40312E" : "#8A8A8A";
    });
  }

  function renderMonth(t: number) {
    monthItemRefs.current.forEach((el, i) => {
      if (!el) return;
      const diff = wrapDelta(i - t, 12);
      const distance = Math.abs(diff);
      el.style.transform = `translateY(${CENTER_OFFSET + diff * ITEM_HEIGHT}px) scale(${Math.max(1 - distance * 0.1, 0.8)})`;
      el.style.opacity = String(Math.max(1 - distance * 0.3, 0.35));
      el.style.fontWeight = distance < 0.5 ? "700" : "400";
      el.style.color = distance < 0.5 ? "#40312E" : "#8A8A8A";
    });
  }

  // total이 바뀌는 모든 경로(월 드래그, 클릭, 휠, 초기 마운트, 설정)가 공통으로 거치는 동기화.
  // 연도 칸은 항상 Math.floor(t/12)로 스냅해서 그린다 — 그래야 그 해 안의 어느 달이든
  // 연도 칸이 흔들리지 않고, 12월↔1월 경계를 넘는 순간에만 정확히 한 칸 넘어간다.
  function syncFromTotal(t: number) {
    renderYear(Math.floor(t / 12));
    renderMonth(t);
  }

  function liveRenderMonth(t: number) {
    const clamped = clamp(t, minTotal, maxTotal);
    totalRef.current = clamped;
    syncFromTotal(clamped);
    return clamped;
  }

  useEffect(() => {
    syncFromTotal(initialTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commitTotal(t: number, animate: boolean) {
    const clamped = clamp(Math.round(t), minTotal, maxTotal);
    totalRef.current = clamped;
    if (yearTrackRef.current) {
      yearTrackRef.current.style.transition = animate ? "transform 200ms ease-out" : "none";
    }
    monthItemRefs.current.forEach((el) => {
      if (el) el.style.transition = animate ? "transform 200ms ease-out" : "none";
    });
    syncFromTotal(clamped);
    setTotal(clamped);
  }

  function handleYearPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    yearDragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startTotal: totalRef.current,
      engaged: false,
    };
  }

  function handleYearPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = yearDragRef.current;
    if (!drag) return;
    e.preventDefault();
    const movedPx = e.clientY - drag.startY;

    if (!drag.engaged) {
      if (Math.abs(movedPx) < DRAG_ENGAGE_PX) return;
      drag.engaged = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (yearTrackRef.current) yearTrackRef.current.style.transition = "none";
    }

    // 연도 칸만의 독립된 소수 위치로 부드럽게 움직인다 — total(따라서 월 칸)은 여기서 건드리지 않는다.
    const deltaItems = movedPx / ITEM_HEIGHT;
    const startYearPos = Math.floor(drag.startTotal / 12);
    const rawYearPos = clamp(startYearPos - deltaItems, 0, years.length - 1);
    drag.liveYearPos = rawYearPos;
    renderYear(rawYearPos);
  }

  function handleYearPointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = yearDragRef.current;
    yearDragRef.current = null;
    if (!drag) return;
    if (drag.engaged) {
      e.currentTarget.releasePointerCapture(drag.pointerId);
      const settledYearIdx = clamp(
        Math.round(drag.liveYearPos ?? Math.floor(drag.startTotal / 12)),
        0,
        years.length - 1,
      );
      const monthOffset = ((drag.startTotal % 12) + 12) % 12;
      commitTotal(settledYearIdx * 12 + monthOffset, true);
    }
    // engaged가 false면(=드래그 문턱을 안 넘겼으면) 아무 것도 안 하고 네이티브 클릭이 그대로 처리하게 둔다
  }

  function handleYearWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    yearWheelAccum.current += e.deltaY;
    if (Math.abs(yearWheelAccum.current) >= WHEEL_STEP_PX) {
      const steps = Math.trunc(yearWheelAccum.current / WHEEL_STEP_PX);
      yearWheelAccum.current -= steps * WHEEL_STEP_PX;
      commitTotal(totalRef.current + steps * 12, true);
    }
    window.clearTimeout(yearWheelResetTimer.current);
    yearWheelResetTimer.current = window.setTimeout(() => {
      yearWheelAccum.current = 0;
    }, 200);
  }

  function handleMonthPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    monthDragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startTotal: totalRef.current,
      engaged: false,
    };
  }

  function handleMonthPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = monthDragRef.current;
    if (!drag) return;
    e.preventDefault();
    const movedPx = e.clientY - drag.startY;

    if (!drag.engaged) {
      if (Math.abs(movedPx) < DRAG_ENGAGE_PX) return;
      drag.engaged = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      monthItemRefs.current.forEach((el) => {
        if (el) el.style.transition = "none";
      });
    }

    const deltaItems = movedPx / ITEM_HEIGHT;
    liveRenderMonth(drag.startTotal - deltaItems);
  }

  function handleMonthPointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = monthDragRef.current;
    monthDragRef.current = null;
    if (!drag) return;
    if (drag.engaged) {
      e.currentTarget.releasePointerCapture(drag.pointerId);
      commitTotal(totalRef.current, true);
    }
  }

  function handleMonthWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    monthWheelAccum.current += e.deltaY;
    if (Math.abs(monthWheelAccum.current) >= WHEEL_STEP_PX) {
      const steps = Math.trunc(monthWheelAccum.current / WHEEL_STEP_PX);
      monthWheelAccum.current -= steps * WHEEL_STEP_PX;
      commitTotal(totalRef.current + steps, true);
    }
    window.clearTimeout(monthWheelResetTimer.current);
    monthWheelResetTimer.current = window.setTimeout(() => {
      monthWheelAccum.current = 0;
    }, 200);
  }

  const displayYear = minYear + Math.floor(total / 12);
  const displayMonth = (((total % 12) + 12) % 12) + 1;

  return (
    <>
      {/* 투명 백드롭 — 바깥을 누르면 닫힘 */}
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      <div
        // 버튼과 top-0/right-0로 같은 꼭짓점을 공유하다 보니, 둥근 모서리(rounded-2xl)가
        // 그 꼭짓점을 깎아내서 버튼의 각진 모서리가 살짝 삐져나와 보였다.
        // 오른쪽 위 모서리만 각지게 둬서 버튼을 완전히 덮게 한다.
        className="absolute right-0 top-0 z-50 w-[280px] rounded-2xl rounded-tr-none bg-white p-4 shadow-lg"
        style={{ animation: "date-picker-slide-down 160ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{keyframes}</style>
        <button
          type="button"
          onClick={onCancel}
          aria-label="닫기"
          className="absolute right-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>
        <div className="mt-4 flex gap-2">
          <div
            className="relative flex-1 touch-none select-none overflow-hidden overscroll-contain"
            style={{ height: VIEWPORT_HEIGHT, cursor: "grab" }}
            onWheel={handleYearWheel}
            onPointerDown={handleYearPointerDown}
            onPointerMove={handleYearPointerMove}
            onPointerUp={handleYearPointerUp}
            onPointerCancel={handleYearPointerUp}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl bg-[#FFEDD5]"
              style={{ height: ITEM_HEIGHT }}
            />
            <div ref={yearTrackRef} className="absolute inset-x-0 top-0">
              {years.map((y, i) => (
                <div
                  key={y}
                  ref={(el) => {
                    yearItemRefs.current[i] = el;
                  }}
                  onClick={() =>
                    commitTotal(i * 12 + (((totalRef.current % 12) + 12) % 12), true)
                  }
                  className="flex cursor-pointer items-center justify-center text-base"
                  style={{ height: ITEM_HEIGHT }}
                >
                  {y}년
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative flex-1 touch-none select-none overflow-hidden overscroll-contain"
            style={{ height: VIEWPORT_HEIGHT, cursor: "grab" }}
            onWheel={handleMonthWheel}
            onPointerDown={handleMonthPointerDown}
            onPointerMove={handleMonthPointerMove}
            onPointerUp={handleMonthPointerUp}
            onPointerCancel={handleMonthPointerUp}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl bg-[#FFEDD5]"
              style={{ height: ITEM_HEIGHT }}
            />
            {Array.from({ length: 12 }, (_, i) => i).map((i) => (
              <div
                key={i}
                ref={(el) => {
                  monthItemRefs.current[i] = el;
                }}
                onClick={() => {
                  const currentMonthIdx = ((totalRef.current % 12) + 12) % 12;
                  const diff = wrapDelta(i - currentMonthIdx, 12);
                  commitTotal(totalRef.current + diff, true);
                }}
                className="absolute inset-x-0 top-0 flex cursor-pointer items-center justify-center text-base"
                style={{ height: ITEM_HEIGHT }}
              >
                {i + 1}월
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onConfirm(displayYear, displayMonth)}
          className="mt-3 w-full cursor-pointer rounded-full bg-[#F97316] py-2.5 text-sm font-medium text-white"
        >
          이동
        </button>
      </div>
    </>
  );
}
