import { useQuery } from "@tanstack/react-query";
import { getCalendar } from "@/domains/calendar/api/calendarApi";

export function useCalendar(year: number, month: number) {
    return useQuery({
        queryKey: ["calendar", year, month],
        queryFn: () => getCalendar(year, month),
    });
}