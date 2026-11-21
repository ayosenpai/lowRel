const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,29}$/;

export function normalizeUsername(value: string): string {
    return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
    return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function getUsernameValidationError(value: string): string | null {
    const normalized = normalizeUsername(value);
    if (normalized.length < USERNAME_MIN_LENGTH || normalized.length > USERNAME_MAX_LENGTH) {
        return `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters.`;
    }
    if (!USERNAME_PATTERN.test(normalized)) {
        return 'Username can use letters, numbers, and underscores, and must start with a letter or number.';
    }
    return null;
}
