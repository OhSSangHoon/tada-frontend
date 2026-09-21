"use client";

import { StickerTriggerButton } from "@/domains/sticker/components/StickerTriggerButton";
import { StickerSidebar } from "@/domains/sticker/components/StickerSidebar";
import { useStickers } from "@/domains/sticker/hooks/useStickers";

export function StickerAlbum() {
  const stickerState = useStickers();

  return (
    <>
      <StickerTriggerButton onClick={stickerState.open} />
      <StickerSidebar {...stickerState} />
    </>
  );
}
