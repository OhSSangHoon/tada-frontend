export interface CalendarItem {
  diaryId: string;
  entryDate: string;
  imageUrl: string;
  keyword: string;
  type: "EXTRACTED" | "COMPRESSED";
}