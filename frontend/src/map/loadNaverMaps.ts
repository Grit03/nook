/// <reference types="navermaps" />

// 네이버 지도 JS API v3 스크립트를 한 번만 불러온다.
// 키는 코드에 넣지 않고 .env.local 의 VITE_NAVER_MAP_CLIENT_ID 로 받는다.
// (공식 문서 기준 파라미터 이름은 ncpKeyId. 예전 ncpClientId 는 더 이상 쓰지 않는다.)

const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
const SCRIPT_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";

export class NaverMapsError extends Error {}

declare global {
  interface Window {
    // 인증 실패 시 네이버 지도 스크립트가 호출하는 전역 함수 (공식 문서)
    navermap_authFailure?: () => void;
  }
}

let loading: Promise<typeof naver.maps> | undefined;
const authFailureListeners = new Set<() => void>();

// 스크립트 로드 이후, 지도를 그리는 시점에 인증이 실패할 수도 있어 구독할 수 있게 둔다.
export function onNaverMapsAuthFailure(listener: () => void) {
  authFailureListeners.add(listener);
  return () => authFailureListeners.delete(listener);
}

export function loadNaverMaps(): Promise<typeof naver.maps> {
  if (loading) return loading;

  if (!CLIENT_ID) {
    return Promise.reject(
      new NaverMapsError(
        "네이버 지도 키가 없어요. frontend/.env.local 에 VITE_NAVER_MAP_CLIENT_ID 를 넣어주세요.",
      ),
    );
  }

  window.navermap_authFailure = () => {
    authFailureListeners.forEach((listener) => listener());
  };

  loading = new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve(window.naver.maps);
      return;
    }
    const script = document.createElement("script");
    script.src = `${SCRIPT_URL}?ncpKeyId=${encodeURIComponent(CLIENT_ID)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else reject(new NaverMapsError("네이버 지도를 불러오지 못했어요."));
    };
    script.onerror = () => {
      loading = undefined; // 네트워크 오류는 다시 시도할 수 있게
      reject(new NaverMapsError("네이버 지도 스크립트를 불러오지 못했어요."));
    };
    document.head.append(script);
  });

  return loading;
}
