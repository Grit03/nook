import { useState } from "react";
import { validateValue, validationRules } from "../../utils/validation";

// 이전 프로젝트의 로그인 폼 검증(login-validation.ts) 흐름을 훅으로 옮긴 것.
// - 필드별 touched 상태: 입력하기 전에는 에러를 보여주지 않는다.
// - 입력할 때마다 실시간 검증, 전체가 유효할 때만 제출 버튼 활성화
// - 제출 시 모든 필드를 touched로 바꾸고 다시 검증
export function useFormValidation<K extends string>(fieldNames: readonly K[]) {
  const init = <V,>(v: V) =>
    Object.fromEntries(fieldNames.map((n) => [n, v])) as Record<K, V>;

  const [values, setValues] = useState(() => init(""));
  const [touched, setTouched] = useState(() => init(false));

  const results = Object.fromEntries(
    fieldNames.map((n) => [n, validateValue(values[n].trim(), validationRules[n])]),
  ) as Record<K, ReturnType<typeof validateValue>>;

  const isValid = fieldNames.every((n) => results[n].isValid);

  const change = (name: K, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true })); // 입력 시 touched 상태로 변경
  };

  const touchAll = () => setTouched(init(true));

  // touched된 필드만 에러/성공 상태를 표시
  const fieldStatus = (name: K) => {
    if (!touched[name]) return { state: "", message: "" };
    if (!results[name].isValid) return { state: "error", message: results[name].message };
    return { state: values[name].trim() ? "success" : "", message: "" };
  };

  const trimmed = () =>
    Object.fromEntries(fieldNames.map((n) => [n, values[n].trim()])) as Record<K, string>;

  return { values, change, touchAll, isValid, fieldStatus, trimmed };
}
