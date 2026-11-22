export interface Region {
  id: string;
  name: string;
  note: string;
  // [lng, lat]
  sw: [number, number];
  ne: [number, number];
}

// 지역 버튼을 누르면 지도를 이 경계 사각형에 맞춰 이동한다. 지도를 못 쓸 때는 이 사각형으로 바로 검색한다.
export const REGIONS: Region[] = [
  { id: "jeju", name: "제주", note: "돌담 골목과 오름 사이", sw: [126.15, 33.18], ne: [126.98, 33.58] },
  { id: "gangneung", name: "강릉", note: "파도 소리 들리는 바닷가", sw: [128.72, 37.62], ne: [129.08, 37.92] },
  { id: "gyeongju", name: "경주", note: "기와지붕 아래 하룻밤", sw: [129.05, 35.72], ne: [129.38, 35.95] },
  { id: "jeonju", name: "전주", note: "한옥마을 느린 산책", sw: [127.02, 35.74], ne: [127.24, 35.9] },
  { id: "yeosu", name: "여수", note: "밤바다가 보이는 언덕", sw: [127.5, 34.62], ne: [127.82, 34.88] },
  { id: "sokcho", name: "속초", note: "설악과 바다 사이", sw: [128.45, 38.1], ne: [128.65, 38.28] },
  { id: "busan", name: "부산", note: "골목마다 다른 바다", sw: [128.92, 35.04], ne: [129.26, 35.26] },
  { id: "seoul", name: "서울", note: "도심 속 작은 쉼표", sw: [126.84, 37.47], ne: [127.14, 37.66] },
];
