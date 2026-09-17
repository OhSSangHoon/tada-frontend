import { useMutation } from "@tanstack/react-query";
import { generateSticker } from "@/domains/diary/api/diaryApi";

export function useGenerateSticker() {
    return useMutation({
        mutationFn: (keyword: string) => generateSticker(keyword),
    });
}
