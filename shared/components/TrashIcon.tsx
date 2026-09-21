interface TrashIconProps {
  className?: string;
}

export function TrashIcon({ className }: TrashIconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
      <rect x="18" y="4" width="12" height="6" rx="2.5" />
      <rect x="9" y="10" width="30" height="6" rx="3" />
      <path
        fillRule="evenodd"
        d="M13 18h22l-1.6 21.2A3 3 0 0 1 30.4 42H17.6a3 3 0 0 1-3-2.8L13 18zM18 23a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0V23zM23 23a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0V23zM28 23a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0V23z"
      />
    </svg>
  );
}
