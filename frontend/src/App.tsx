import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Home from "./page/home/Home";
import AuthPage from "./page/auth/AuthPage";
import { authStore } from "./store/auth";
import { useSession } from "./store/useAuth";

// 이전 프로젝트의 서버 라우터와 같은 규칙: 로그인 상태에서 로그인/회원가입 페이지에 오면 홈으로 보낸다.
function GuestOnly({ children }: { children: ReactNode }) {
  const session = useSession();
  return session ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <AuthPage
                mode="login"
                fields={[
                  { name: "email", label: "이메일", type: "email", autoComplete: "email" },
                  { name: "password", label: "비밀번호", type: "password", autoComplete: "current-password" },
                ]}
                onSubmit={({ email, password }) => authStore.signIn({ email, password })}
              />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <AuthPage
                mode="signup"
                fields={[
                  { name: "name", label: "이름", type: "text", autoComplete: "name" },
                  { name: "email", label: "이메일", type: "email", autoComplete: "email" },
                  { name: "password", label: "비밀번호", type: "password", autoComplete: "new-password" },
                ]}
                onSubmit={({ email, name, password }) => authStore.signUp({ email, name, password })}
              />
            </GuestOnly>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
