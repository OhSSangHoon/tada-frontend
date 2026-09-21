import { CalendarSection } from "@/domains/calendar/components/CalendarSection";
import { SearchModal } from "@/domains/search/components/SearchModal";
import { StickerAlbum } from "@/domains/sticker/components/StickerAlbum";

export default function Home() {
  return (
    <>
      <CalendarSection />
      <SearchModal />
      <StickerAlbum />
    </>
  );
}
