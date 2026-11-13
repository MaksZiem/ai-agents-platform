export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(email: string): string | undefined {
  if (!email) return "Enter your email.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email, e.g. name@company.com.";
  return undefined;
}

export function newPasswordError(password: string): string | undefined {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `Use ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`;
  }
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
