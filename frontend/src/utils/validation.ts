// 이전 프로젝트의 로그인 폼 검증 로직(login-validation.ts)의 규칙/검증 함수를 옮긴 것.
// 아이디 대신 이메일, 회원가입용 이름 규칙을 추가했다.

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// 검증 규칙 정의
export const validationRules: ValidationRules = {
  email: {
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "올바른 이메일 형식이 아닙니다",
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 30,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
    message: "비밀번호는 6자 이상, 영문과 숫자를 포함해야 합니다",
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: "이름은 1-50자로 입력해주세요",
  },
};

// 검증 로직 실행
export const validateValue = (
  value: string,
  rule: ValidationRule,
): ValidationResult => {
  if (rule.required && !value) {
    return { isValid: false, message: rule.message || "필수 입력 항목입니다" };
  }

  if (!value) {
    return { isValid: true, message: "" };
  }

  if (rule.minLength && value.length < rule.minLength) {
    return { isValid: false, message: rule.message || "" };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return { isValid: false, message: rule.message || "" };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message || "" };
  }

  return { isValid: true, message: "" };
};
