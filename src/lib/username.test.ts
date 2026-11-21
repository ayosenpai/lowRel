import { describe, expect, it } from 'vitest';
import { getUsernameValidationError, isValidUsername, normalizeUsername } from './username';

describe('username', () => {
  it('normalizes usernames', () => {
    expect(normalizeUsername('  Low_Religion  ')).toBe('low_religion');
  });

  it('accepts valid usernames', () => {
    expect(isValidUsername('lowrel_01')).toBe(true);
    expect(getUsernameValidationError('lowrel_01')).toBeNull();
  });

  it('rejects invalid usernames', () => {
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('bad-name')).toBe(false);
    expect(getUsernameValidationError('ab')).toContain('3-30');
  });
});
