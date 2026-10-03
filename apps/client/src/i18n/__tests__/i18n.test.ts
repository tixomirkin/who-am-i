import { describe, it, expect } from 'vitest';
import { ru } from '../locales/ru';
import { en } from '../locales/en';

describe('i18n Localization', () => {
  it('has matching translation keys between ru and en', () => {
    const ruKeys = Object.keys(ru).sort();
    const enKeys = Object.keys(en).sort();

    expect(ruKeys).toEqual(enKeys);
  });

  it('contains non-empty strings for all keys', () => {
    Object.entries(ru).forEach(([key, val]) => {
      expect(val, `ru[${key}]`).toBeTruthy();
    });

    Object.entries(en).forEach(([key, val]) => {
      expect(val, `en[${key}]`).toBeTruthy();
    });
  });
});
