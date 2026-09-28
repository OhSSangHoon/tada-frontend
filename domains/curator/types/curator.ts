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

export interface PersonRenameRequest {
  displayName: string;
}

export type PersonCorrectionRequest =
  | {
      targetPersonId: string;
      newDisplayName?: never;
    }
  | {
      targetPersonId?: never;
      newDisplayName: string;
    };

export interface CorrectPersonParams {
  personId: string;
  candidateId: string;
  request: PersonCorrectionRequest;
}

export interface PersonMemoryStickerResponse {
  imageUrl: string;
  keyword: string;
}

export interface PersonMemoryDiaryResponse {
  id: string;
  entryDate: string;
  title: string;
  stickerUrl: string | null;
}

export interface PersonMemoryGroupResponse {
  groupType: "PLACE" | "ACTIVITY";
  groupKey: string;
  firstEntryDate: string;
  lastEntryDate: string;
  diaryCount: number;
  stickers: PersonMemoryStickerResponse[];
  diaries: PersonMemoryDiaryResponse[];
}

export type MemoryRecallType =
  | "TWELVE_MONTHS_AGO"
  | "SIX_MONTHS_AGO"
  | "THREE_MONTHS_AGO"
  | "PERSON"
  | "PLACE"
  | "ACTIVITY"
  | "SAME_WEEKDAY"
  | "FIRST_ENTRY"
  | "FALLBACK";

export interface MemoryRecallResponse {
  eventType: MemoryRecallType;
  message: string | null;
  diaryId: string;
  entryDate: string;
  title: string;
  contentPreview: string | null;
  stickerUrl: string | null;
  tags: string[];
}
