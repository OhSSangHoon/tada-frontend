"use client";

import { TrashIcon } from "@/shared/components/TrashIcon";
import { TrashPanel } from "@/domains/diary/components/TrashPanel";
import { PeoplePanel } from "@/domains/curator/components/PeoplePanel";
import { SidePanelRail } from "@/shared/components/side-panel/SidePanelRail";
import { SidePanelPlaceholder } from "@/shared/components/side-panel/SidePanelParts";
import { StickerPanel } from "@/domains/sticker/components/StickerPanel";
import {
  AlbumIcon,
  MemoryIcon,
  PeopleIcon,
} from "@/shared/components/side-panel/icons";

// 오른쪽 사이드 버튼 목록 (위에서부터 순서대로). 각 담당자는 자기 항목의 renderContent만 교체하면 된다.
const items = [
  {
    id: "memories",
    label: "다시 꺼내본 일기",
    icon: <MemoryIcon className="h-7 w-7" />,
    renderContent: () => (
      <SidePanelPlaceholder
        title="다시 꺼내본 일기"
        description="작년 이맘때 어떤 하루를 보냈는지 다시 볼 수 있어요."
      />
    ),
  },
  {
    id: "people",
    label: "내 기록 속 사람들",
    icon: <PeopleIcon className="h-7 w-7" />,
    renderContent: (isOpen: boolean) => (
      <PeoplePanel
        key={isOpen ? "people-open" : "people-closed"}
        isOpen={isOpen}
      />
    ),
  },
  {
    id: "album",
    label: "스티커 앨범",
    icon: <AlbumIcon className="h-7 w-7" />,
    renderContent: (isOpen: boolean) => <StickerPanel isOpen={isOpen} />,
  },
  {
    id: "trash",
    label: "휴지통",
    icon: <TrashIcon className="h-7 w-7" />,
    renderContent: (isOpen: boolean) => <TrashPanel isOpen={isOpen} />,
  },
];

export function SidePanels() {
  return <SidePanelRail items={items} />;
}
