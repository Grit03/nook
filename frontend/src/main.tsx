import "./style/reset.css";
import "./style/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Loader from "./component/Loader";
import { authStore } from "./store/auth";

const root = createRoot(document.getElementById("root")!);

// 이전 프로젝트의 init()과 같은 흐름: 로딩 UI → 세션 확인(refresh) → 앱 렌더링
async function init() {
  root.render(
    <main className="boot">
      <Loader />
    </main>,
  );

  await authStore.setSession();

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
