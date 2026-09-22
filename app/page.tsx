import { CalendarSection } from "@/domains/calendar/components/CalendarSection";
import { SearchModal } from "@/domains/search/components/SearchModal";
import { SidePanels } from "./SidePanels";

export default function Home() {
  return (
    <>
      <CalendarSection />
      <SearchModal />
      <SidePanels />
    </>
  );
}
