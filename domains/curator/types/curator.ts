export interface PersonSummaryResponse {
  id: string;
  displayName: string;
  aliases: string[];
  mentionCount: number;
  lastMentionedAt: string;
  stickerUrl: string | null;
}

export interface PersonEntityStatResponse {
  normalizedText: string;
  diaryCount: number;
}

export interface PersonDetailResponse {
  id: string;
  displayName: string;
  stickerUrl: string | null;
  mentionCount: number;
  firstMentionedAt: string | null;
  lastMentionedAt: string | null;
  topPlaces: PersonEntityStatResponse[];
  topActivities: PersonEntityStatResponse[];
}

export interface PersonTimelineCandidateResponse {
  id: string;
  rawText: string;
}

export interface PersonTimelineItemResponse {
  diaryId: string;
  personCandidates: PersonTimelineCandidateResponse[];
  entryDate: string;
  title: string;
  stickerUrl: string | null;
  keywords: string[];
}

export interface PersonTimelinePageResponse {
  items: PersonTimelineItemResponse[];
  nextCursor: string | null;
}

export type PersonTimelineSort = "LATEST" | "OLDEST";
