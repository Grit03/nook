import { useSyncExternalStore } from "react";
import { authStore } from "./auth";

// 옵저버 패턴 AuthStore를 React에 연결한다.
// subscribe/unsubscribe를 그대로 쓰고, 컴포넌트는 세션이 바뀔 때마다 다시 렌더링된다.
const subscribe = (onChange: () => void) => {
  authStore.subscribe(onChange);
  return () => authStore.unsubscribe(onChange);
};

export function useSession() {
  return useSyncExternalStore(subscribe, () => authStore.getSession());
}
