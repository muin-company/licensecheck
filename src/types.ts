export interface PackageLicense {
  name: string;
  version: string;
  license: string | null;
  category: 'permissive' | 'copyleft' | 'unknown';
}

export interface LicenseCheckOptions {
  deny?: string[];
  json?: boolean;
  summary?: boolean;
}

export interface LicenseCheckResult {
  packages: PackageLicense[];
  summary: {
    permissive: number;
    copyleft: number;
    unknown: number;
    denied: number;
  };
  hasIssues: boolean;
}
