import { describe, it, expect } from 'vitest';
import { classifyLicense, isDenied } from './classifier';

describe('classifyLicense', () => {
  it('should classify MIT as permissive', () => {
    expect(classifyLicense('MIT')).toBe('permissive');
  });
  
  it('should classify GPL-3.0 as copyleft', () => {
    expect(classifyLicense('GPL-3.0')).toBe('copyleft');
  });
  
  it('should classify AGPL as copyleft', () => {
    expect(classifyLicense('AGPL')).toBe('copyleft');
  });
  
  it('should classify null as unknown', () => {
    expect(classifyLicense(null)).toBe('unknown');
  });
  
  it('should classify unknown license string as unknown', () => {
    expect(classifyLicense('PROPRIETARY')).toBe('unknown');
  });
  
  it('should handle Apache-2.0 as permissive', () => {
    expect(classifyLicense('Apache-2.0')).toBe('permissive');
  });
  
  it('should handle BSD variants as permissive', () => {
    expect(classifyLicense('BSD-3-Clause')).toBe('permissive');
    expect(classifyLicense('BSD-2-Clause')).toBe('permissive');
  });
});

describe('isDenied', () => {
  it('should return true if license is in deny list', () => {
    expect(isDenied('GPL-3.0', ['GPL-3.0'])).toBe(true);
  });
  
  it('should return false if license is not in deny list', () => {
    expect(isDenied('MIT', ['GPL-3.0'])).toBe(false);
  });
  
  it('should handle case-insensitive matching', () => {
    expect(isDenied('gpl-3.0', ['GPL-3.0'])).toBe(true);
  });
  
  it('should return false for null license', () => {
    expect(isDenied(null, ['GPL-3.0'])).toBe(false);
  });
  
  it('should handle partial matches', () => {
    expect(isDenied('GPL-3.0-or-later', ['GPL-3.0'])).toBe(true);
  });
});
