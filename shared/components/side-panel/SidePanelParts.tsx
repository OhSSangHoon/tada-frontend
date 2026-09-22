import type { ReactNode, Ref } from "react";

interface SidePanelHeaderProps {
  title: string;
  badge?: number;
  description?: string;
}

export function SidePanelHeader({
  title,
  badge,
  description,
}: SidePanelHeaderProps) {
  return (
    <div className="shrink-0 px-6 pb-4 pt-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-[#40312E]">{title}</h2>
        {badge !== undefined && (
          <span className="rounded-full bg-[#FFEDD5] px-2.5 py-0.5 text-xs font-semibold text-[#F97316]">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}

export function SidePanelBody({
  children,
  ref,
}: {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
      {children}
    </div>
  );
}

interface SidePanelPlaceholderProps {
  title: string;
  description?: string;
}

export function SidePanelPlaceholder({
  title,
  description,
}: SidePanelPlaceholderProps) {
  return (
    <>
      <SidePanelHeader title={title} description={description} />
      <SidePanelBody>
        <p className="py-16 text-center text-sm text-gray-400">
          준비 중이에요.
        </p>
      </SidePanelBody>
    </>
  );
}
