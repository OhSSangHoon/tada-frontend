export interface CalendarResponseItem {
  diaryId: string;
  entryDate: string;
  imageUrl: string;
  keyword: string;
  type: "EXTRACTED" | "COMPRESSED";
}

export type CalendarResponse = CalendarResponseItem[];
