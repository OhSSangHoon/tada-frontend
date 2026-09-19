import { CalendarSection } from "@/domains/calendar/components/CalendarSection";
import { SearchModal } from "@/domains/search/components/SearchModal";

export default function Home() {
  return (
    <>
      <CalendarSection />
      <SearchModal />
    </>
  );
}
