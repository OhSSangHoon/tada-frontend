"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmClassName?: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  message,
  confirmLabel,
  cancelLabel,
  confirmClassName = "bg-red-500 text-white",
  isPending,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // 애니메이션(transform)이 걸린 사이드 패널 안에서 열려도 화면 전체를 덮도록 body로 옮겨 그린다
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-[420px] rounded-3xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-center text-sm text-gray-700">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 cursor-pointer rounded-full py-3 font-medium disabled:opacity-40 ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-full bg-[#FFEDD5] py-3 font-medium text-[#F97316]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
