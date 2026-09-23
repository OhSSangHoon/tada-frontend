// createdAt(LocalDateTime -> ISO 8601, 예: "2026-09-16T10:23:45")을 "MM.DD" 형태로 표시
// domains/diary/utils/date.ts와 동일하게, new Date() 파싱 대신 문자열을 직접 split해서
// 타임존 영향을 받지 않도록 처리 (백엔드가 이미 zero-padded 월/일로 내려주므로 별고 padStart 불필요)

export function formatStickerDate(isoString: string): string {
  const [datePart] = isoString.split("T");
  const [, month, day] = datePart.split("-");
  return `${month}.${day}`;
}
