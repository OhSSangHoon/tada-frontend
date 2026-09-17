import { useMutation } from "@tanstack/react-query";
import { checkCanCreate } from "@/domains/diary/api/diaryApi";

export function useCanCreate() {
    return useMutation({
        mutationFn: (date: string) => checkCanCreate(date),
    });
}
