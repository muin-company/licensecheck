import { LicenseCheckOptions, LicenseCheckResult } from './types';
import { scanNodeModules } from './scanner';
import { isDenied } from './classifier';

export function checkLicenses(
  rootDir: string = process.cwd(),
  options: LicenseCheckOptions = {}
): LicenseCheckResult {
  const packages = scanNodeModules(rootDir);
  const denyList = options.deny || [];
  
  const summary = {
    permissive: 0,
    copyleft: 0,
    unknown: 0,
    denied: 0,
  };
  
  packages.forEach(pkg => {
    summary[pkg.category]++;
    if (isDenied(pkg.license, denyList)) {
      summary.denied++;
    }
  });
  
  const hasIssues = summary.copyleft > 0 || summary.unknown > 0 || summary.denied > 0;
  
  return {
    packages,
    summary,
    hasIssues,
  };
}
