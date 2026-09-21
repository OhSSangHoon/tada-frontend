const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// "2026-09-16" -> "9월 16일 수요일"
export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}월 ${d}일 ${WEEKDAY_NAMES[date.getDay()]}요일`;
}

// "2026-09-16" -> "9월 16일"
export function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일`;
}
