import "./auth.css";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useFormValidation } from "./useFormValidation";

type FieldName = "email" | "password" | "name";

export interface FieldConfig {
  name: FieldName;
  label: string;
  type: string;
  autoComplete: string;
}

interface Props {
  mode: "login" | "signup";
  fields: FieldConfig[];
  onSubmit: (values: Record<FieldName, string>) => Promise<void>;
}

export default function AuthPage({ mode, fields, onSubmit }: Props) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const form = useFormValidation(fields.map((f) => f.name));
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // 제출 시 모든 필드를 touched 상태로 변경
    form.touchAll();
    if (!form.isValid) return;

    setSubmitting(true);
    try {
      await onSubmit(form.trimmed() as Record<FieldName, string>);
      navigate("/", { replace: true });
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "요청에 실패했어요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__side">
        <Link to="/" aria-label="nook 홈">
          <strong>nook</strong>
        </Link>
        <p className="auth__quote">
          {isLogin ? (
            <>
              다시 오셨군요.
              <br />
              이번엔 어느 동네로 갈까요?
            </>
          ) : (
            <>
              작은 집에서 보내는
              <br />
              느린 하룻밤.
            </>
          )}
        </p>
        <small>게스트하우스 · 한옥 · 독채</small>
      </aside>
      <section className="auth__panel">
        <form className="auth__form" noValidate onSubmit={handleSubmit}>
          <h1>{isLogin ? "로그인" : "회원가입"}</h1>
          <p>{isLogin ? "이메일로 로그인하세요." : "이메일만 있으면 바로 시작할 수 있어요."}</p>
          <div className="auth__alert" role="alert">
            {alert}
          </div>
          {fields.map((f, i) => {
            const status = form.fieldStatus(f.name);
            return (
              <div key={f.name} className={`auth__input ${status.state}`}>
                <label htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  autoFocus={i === 0}
                  value={form.values[f.name]}
                  aria-invalid={status.state === "error" || undefined}
                  aria-describedby={`${f.name}-error`}
                  onChange={(e) => {
                    setAlert("");
                    form.change(f.name, e.target.value);
                  }}
                />
                <p className="auth__error" id={`${f.name}-error`}>
                  {status.message}
                </p>
              </div>
            );
          })}
          <button
            className="btn btn--solid auth__submit"
            type="submit"
            disabled={!form.isValid || submitting}
          >
            {submitting ? "잠시만요…" : isLogin ? "로그인" : "가입하기"}
          </button>
          <p className="auth__switch">
            {isLogin ? (
              <>
                처음이신가요? <Link to="/signup">회원가입</Link>
              </>
            ) : (
              <>
                이미 계정이 있나요? <Link to="/login">로그인</Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
