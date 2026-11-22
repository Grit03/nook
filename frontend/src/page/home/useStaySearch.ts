import { useEffect, useState } from "react";
import { searchStays, type SearchParams } from "../../api/stay";
import type { Stay } from "../../types";

type Settled =
  | { key: string; status: "done"; stays: Stay[] }
  | { key: string; status: "error"; message: string };

export type SearchResult = Settled | { status: "loading" } | { status: "idle" };

// params 가 null 이면 검색하지 않는다 (예: 지도가 너무 넓게 보일 때)
export function useStaySearch(params: SearchParams | null) {
  const [settled, setSettled] = useState<Settled>();
  const [attempt, setAttempt] = useState(0);
  // 같은 조건이라도 "다시 시도"하면 새 요청으로 취급한다.
  const key = params ? `${JSON.stringify(params)}#${attempt}` : null;

  useEffect(() => {
    if (!key) return;
    let ignore = false; // 늦게 도착한 이전 요청은 무시
    const query = JSON.parse(key.slice(0, key.lastIndexOf("#"))) as SearchParams;
    searchStays(query)
      .then((stays) => {
        if (!ignore) setSettled({ key, status: "done", stays });
      })
      .catch((e: unknown) => {
        if (!ignore)
          setSettled({
            key,
            status: "error",
            message: e instanceof Error ? e.message : "스테이를 불러오지 못했어요.",
          });
      });
    return () => {
      ignore = true;
    };
  }, [key]);

  // 현재 조건에 대한 응답이 아직 없으면 로딩 상태로 본다.
  const result: SearchResult = !key
    ? { status: "idle" }
    : settled && settled.key === key
      ? settled
      : { status: "loading" };

  return { result, retry: () => setAttempt((n) => n + 1) };
}
