import Image from "next/image";
import type { StickerResponse } from "@/domains/sticker/types/sticker";
import { formatStickerDate } from "@/domains/sticker/utils/formatStickerDate";

interface StickerGridViewProps {
  stickers: StickerResponse[];
}

export function StickerGridView({ stickers }: StickerGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 p-4 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white">
            <Image
              src={sticker.imageUrl}
              alt={sticker.keyword}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            {formatStickerDate(sticker.createdAt)}
          </p>
          <p className="line-clamp-1 text-xs text-gray-500">
            {sticker.keyword}
          </p>
        </div>
      ))}
    </div>
  );
}
