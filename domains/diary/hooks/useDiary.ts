import { useQuery } from "@tanstack/react-query";
import { getDiary } from "@/domains/diary/api/diaryApi";

export function useDiary(id: string) {
    return useQuery({
        queryKey: ["diary", id],
        queryFn: () => getDiary(id),
    });
}
