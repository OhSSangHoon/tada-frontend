"use client";

import { useState } from "react";
import { TrashIcon } from "@/shared/components/TrashIcon";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TrashPanel } from "@/domains/diary/components/TrashPanel";
import { PeoplePanel } from "@/domains/curator/components/PeoplePanel";
import { MemoryRecallPanel } from "@/domains/curator/components/MemoryRecallPanel";
import { SidePanelRail } from "@/shared/components/side-panel/SidePanelRail";
import { StickerPanel } from "@/domains/sticker/components/StickerPanel";
import { useLogout } from "@/domains/auth/hooks/useLogout";
import {
  AlbumIcon,
  LogoutIcon,
  MemoryIcon,
  PeopleIcon,
} from "@/shared/components/side-panel/icons";

// 오른쪽 사이드 버튼 목록 (위에서부터 순서대로). 각 담당자는 자기 항목의 renderContent만 교체하면 된다.
const items = [
  {
    id: "memories",
    label: "다시 꺼내본 일기",
    icon: <MemoryIcon className="h-7 w-7" />,
    renderContent: (isOpen: boolean) => (
      <MemoryRecallPanel
        key={isOpen ? "memory-recall-open" : "memory-recall-closed"}
        isOpen={isOpen}
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
  const logoutMutation = useLogout();

  // 로그아웃 확인창이 열려 있는지 관리한다.
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <>
      <SidePanelRail
        items={[
          ...items,
          {
            id: "logout",
            label: "로그아웃",
            icon: <LogoutIcon className="h-7 w-7" />,
            onClick: () => setIsLogoutConfirmOpen(true),
          },
        ]}
      />

      {isLogoutConfirmOpen && (
        <ConfirmModal
          message="로그아웃할까요?"
          confirmLabel="로그아웃"
          cancelLabel="취소"
          isPending={logoutMutation.isPending}
          onConfirm={() => logoutMutation.mutate()}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />
      )}
    </>
  );
}
