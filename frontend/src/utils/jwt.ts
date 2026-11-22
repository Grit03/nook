import type { Session } from "../types";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

// access token의 payload(base64url)를 읽어 세션 정보로 변환한다.
// 서명 검증은 서버(AccessTokenGuard)의 몫이고, 여기서는 화면 표시용으로만 쓴다.
export function decodeSession(token: string): Session | undefined {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return undefined;
  }
}
