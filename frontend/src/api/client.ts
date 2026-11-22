// access token은 메모리에만 보관하고, refresh token은 서버가 httpOnly 쿠키로 관리한다.
let accessToken: string | undefined;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token?: string) {
  accessToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function toError(response: Response) {
  let message = "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.";
  try {
    const body = await response.json();
    if (typeof body?.message === "string") message = body.message;
    else if (Array.isArray(body?.message)) message = body.message[0];
  } catch {
    /* 본문 없음 */
  }
  return new ApiError(response.status, message);
}

// POST /auth/refresh: 쿠키의 refresh token으로 새 토큰 발급
export async function refreshAccessToken(): Promise<string | undefined> {
  const response = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    setAccessToken(undefined);
    return undefined;
  }
  const data = (await response.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

// 인증이 필요한 요청: 401이면 한 번만 refresh 후 재시도
export async function authFetch(input: string, init: RequestInit = {}) {
  const send = () =>
    fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let response = await send();
  if (response.status === 401 && (await refreshAccessToken())) {
    response = await send();
  }
  if (!response.ok) throw await toError(response);
  return response;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await toError(response);
  return response.json() as Promise<T>;
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw await toError(response);
  return response.json() as Promise<T>;
}
