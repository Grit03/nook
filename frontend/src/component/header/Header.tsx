import "./header.css";
import { useState } from "react";
import { Link } from "react-router";
import { authStore } from "../../store/auth";
import { useSession } from "../../store/useAuth";

// 이전 프로젝트의 Header처럼 authStore를 구독하고, 세션 유무에 따라 버튼을 바꿔 그린다.
export default function Header() {
  const session = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authStore.signOut();
    setSigningOut(false);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="nook 홈">
          <strong>nook</strong>
          <span>작은 동네 스테이</span>
        </Link>
        <ul className="header__actions">
          {session ? (
            <>
              <li className="header__greeting">
                안녕하세요, <b>{session.name}</b>님
              </li>
              <li>
                <button
                  className="btn btn--ghost"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="btn btn--ghost" to="/login">
                  로그인
                </Link>
              </li>
              <li>
                <Link className="btn btn--solid" to="/signup">
                  회원가입
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
