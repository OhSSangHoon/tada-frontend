import { NextRequest, NextResponse } from "next/server";

// n8n diary-analysis 웹훅은 인증이 없어서 URL이 그대로 노출되면 우리 앱을 거치지 않고도
// 누구나 무제한으로 호출해 Gemini 비용을 태울 수 있다. 그래서 클라이언트에 직접 주지 않고
// 이 서버 라우트를 한 번 거치게 한다 (DIARY_ANALYSIS_WEBHOOK_URL은 NEXT_PUBLIC_ 없이 서버 전용).
const WEBHOOK_URL = process.env.DIARY_ANALYSIS_WEBHOOK_URL;

interface N8nDiaryAnalysisResponse {
  title: string;
  compressedKeyword: string;
  extractedKeywords: string[];
  persons: unknown[];
  places: unknown[];
  activities: unknown[];
}

export async function POST(request: NextRequest) {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { message: "DIARY_ANALYSIS_WEBHOOK_URL이 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const { content, weather } = await request.json();

  let n8nResponse: Response;
  try {
    n8nResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, weather: weather ?? null }),
    });
  } catch {
    return NextResponse.json(
      { message: "AI 제목 생성에 실패했습니다. 다시 시도해주세요." },
      { status: 502 },
    );
  }

  if (!n8nResponse.ok) {
    return NextResponse.json(
      { message: "AI 제목 생성에 실패했습니다. 다시 시도해주세요." },
      { status: 502 },
    );
  }

  // n8n이 200을 주고도 빈 응답/JSON이 아닌 응답을 줄 때가 있다(Gemini 타임아웃 등) —
  // 이걸 그냥 두면 여기서 예외가 그대로 터져서 이 라우트 자체가 빈 응답을 내려주고,
  // 클라이언트에서는 "Unexpected end of JSON input"이라는 알아보기 힘든 에러로만 보인다.
  let data: N8nDiaryAnalysisResponse;
  try {
    data = await n8nResponse.json();
  } catch {
    return NextResponse.json(
      { message: "AI가 응답을 제대로 주지 않았어요. 다시 시도해주세요." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    title: data.title,
    compressedKeyword: data.compressedKeyword,
    extractedKeywords: data.extractedKeywords,
    extractionResult: {
      persons: data.persons,
      places: data.places,
      activities: data.activities,
    },
  });
}
