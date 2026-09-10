// 백엔드 ApiResponse<T> (global/response/ApiResponse.java)와 1:1 매핑되는 타입.
// 백엔드가 항상 { success, data, message } 형태로만 응답하므로,
// 도메인 어디서 호출하든 이 타입 하나로 파싱하면 된다.
//
// 도메인 쪽에서는 이렇게 감싸서 씀:
//   type DiaryResponse = ApiResponse<{ id: string; title: string; imageUrl: string }>;
export interface ApiResponse<T> {
  success: boolean;
  data: T | null; // 성공 시 실제 데이터, 실패 시 null
  message: string | null; // 실패 시 에러 메시지, 성공 시 null
}
