// 메인페이지(캘린더 화면) 배경 - 디자인 프레임(1920x1080) 기준으로 주황 배경 + 정중앙의 큰 TADA 로고(불투명도 5%)
export function MainBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F97316]"
    >
      <div
        className="absolute left-1/2 aspect-[2235/807] w-[116.4vw] -translate-x-1/2 -translate-y-1/2 bg-[url('/tada-logo-bg.png')] bg-cover bg-center opacity-5"
        style={{ top: "calc(50% - 9.5px)" }}
      />
    </div>
  );
}
