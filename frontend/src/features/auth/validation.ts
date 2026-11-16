export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "emailRequired"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordLength"
  | "invalidCredentials"
  | "emailTaken";

export function emailError(email: string): AuthErrorKey | undefined {
  if (!email) return "emailRequired";
  if (!EMAIL_PATTERN.test(email)) return "emailInvalid";
  return undefined;
}

export function newPasswordError(password: string): AuthErrorKey | undefined {
  if (!password) return "passwordRequired";
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return "passwordLength";
  }
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
