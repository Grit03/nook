import type { Session } from "../types";
import {
  authFetch,
  getAccessToken,
  postJson,
  refreshAccessToken,
  setAccessToken,
} from "../api/client";
import { decodeSession } from "../utils/jwt";

// 이전 프로젝트의 AuthStore(옵저버 패턴)를 JWT 기반으로 옮긴 것.
// 세션 출처만 `GET /api/auth`(세션 쿠키) → `POST /auth/refresh`(refresh 토큰 쿠키)로 바뀌었다.
class AuthStore {
  private session?: Session;
  private listeners: ((session?: Session) => void)[] = [];

  private notify() {
    this.listeners.forEach((listener) => listener(this.session));
  }

  private applyToken(token?: string) {
    setAccessToken(token);
    this.session = token ? decodeSession(token) : undefined;
    this.notify();
  }

  // 앱 시작 시 호출: refresh 쿠키가 유효하면 access token을 받아 세션을 복원한다.
  async setSession() {
    const token = await refreshAccessToken();
    this.applyToken(token);
  }

  async signIn(body: { email: string; password: string }) {
    const { accessToken } = await postJson<{ accessToken: string }>(
      "/auth/signin",
      body,
    );
    this.applyToken(accessToken);
  }

  async signUp(body: { email: string; name: string; password: string }) {
    const { accessToken } = await postJson<{ accessToken: string }>(
      "/auth/signup",
      body,
    );
    this.applyToken(accessToken);
  }

  // GET /auth/signout (AccessTokenGuard): 서버에서 레디스의 refresh token을 지운다.
  async signOut() {
    try {
      if (getAccessToken()) await authFetch("/auth/signout");
    } finally {
      this.applyToken(undefined);
    }
  }

  getSession() {
    return this.session;
  }

  subscribe(listener: (session?: Session) => void) {
    this.listeners.push(listener);
    // 등록하면서 실행
    listener(this.session);
  }

  unsubscribe(listener: (session?: Session) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}

export const authStore = new AuthStore();
