const PERMISSIVE_LICENSES = [
  'MIT',
  'Apache-2.0',
  'Apache',
  'BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'Unlicense',
  '0BSD',
  'CC0-1.0',
  'WTFPL',
];

const COPYLEFT_LICENSES = [
  'GPL',
  'GPL-2.0',
  'GPL-3.0',
  'AGPL',
  'AGPL-3.0',
  'LGPL',
  'LGPL-2.1',
  'LGPL-3.0',
  'MPL-2.0',
  'EPL-1.0',
  'EPL-2.0',
];

export function classifyLicense(license: string | null): 'permissive' | 'copyleft' | 'unknown' {
  if (!license) return 'unknown';
  
  const normalized = license.toUpperCase().trim();
  
  // Check permissive licenses
  if (PERMISSIVE_LICENSES.some(l => normalized.includes(l.toUpperCase()))) {
    return 'permissive';
  }
  
  // Check copyleft licenses
  if (COPYLEFT_LICENSES.some(l => normalized.includes(l.toUpperCase()))) {
    return 'copyleft';
  }
  
  return 'unknown';
}

export function isDenied(license: string | null, denyList: string[]): boolean {
  if (!license) return false;
  
  const normalized = license.toLowerCase().trim();
  return denyList.some(denied => normalized.includes(denied.toLowerCase()));
}
