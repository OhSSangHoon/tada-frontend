export function Footer() {
  return (
    <footer className="w-full bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TADA. All rights reserved.
      </div>
    </footer>
  );
}
