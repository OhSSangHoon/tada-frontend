import localFont from "next/font/local";

// 연/월 버튼과 연/월 휠피커에 쓰는 세방고딕 얇은 굵기 (Bold는 app/layout.tsx의 --font-sebang-gothic)
export const sebangGothicRegular = localFont({
  src: "../fonts/SebangGothic-Regular.woff2",
  weight: "400",
  display: "swap",
});
