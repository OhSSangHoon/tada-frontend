import { useMutation } from "@tanstack/react-query";
import { generateSticker } from "@/domains/diary/api/diaryApi";

interface GenerateStickerParams {
    keyword: string;
    excludeImageUrl?: string;
}

export function useGenerateSticker() {
    return useMutation({
        mutationFn: ({ keyword, excludeImageUrl }: GenerateStickerParams) =>
            generateSticker(keyword, excludeImageUrl),
    });
}
