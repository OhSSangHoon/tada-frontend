interface IconProps {
  className?: string;
}

// 사이드 버튼 아이콘은 모두 48x48 viewBox의 단색(currentColor) 채움 스타일로 통일한다
export function MemoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M24 6a18 18 0 1 0 0 36 18 18 0 0 0 0-36zm0 4a14 14 0 1 1 0 28 14 14 0 0 1 0-28z"
      />
      <path d="M22 16h4v9.2l6 3.5-2 3.4-8-4.7z" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
      <circle cx="18" cy="16" r="6.5" />
      <path d="M5 40c0-7.2 5.8-13 13-13s13 5.8 13 13z" />
      <circle cx="34" cy="18" r="5" opacity=".6" />
      <path
        d="M31 27.6c.9-.4 1.9-.6 3-.6 4.4 0 8 3.6 8 8v5h-9c0-4.6-.8-9.2-2-12.4z"
        opacity=".6"
      />
    </svg>
  );
}

export function AlbumIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
      <path d="M10 6h28a4 4 0 0 1 4 4v16H30a4 4 0 0 0-4 4v12H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" />
      <path d="M42 26L26 42V30a4 4 0 0 1 4-4z" opacity=".6" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
      <path d="M22 6h-8a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h8v-4h-8V10h8z" />
      <path d="M28.6 15.4 26 18l4.6 4.6H16v3.8h14.6L26 31l2.6 2.6L38.4 24z" />
    </svg>
  );
}
