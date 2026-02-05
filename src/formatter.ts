import { LicenseCheckResult, PackageLicense } from './types';

export function formatJson(result: LicenseCheckResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatSummary(result: LicenseCheckResult): string {
  const lines = [
    '📊 License Summary',
    '─────────────────',
    `✅ Permissive: ${result.summary.permissive}`,
    `⚠️  Copyleft:   ${result.summary.copyleft}`,
    `❓ Unknown:    ${result.summary.unknown}`,
  ];
  
  if (result.summary.denied > 0) {
    lines.push(`🚫 Denied:     ${result.summary.denied}`);
  }
  
  lines.push(`───────────────────`);
  lines.push(`Total packages: ${result.packages.length}`);
  
  return lines.join('\n');
}

export function formatDetailed(result: LicenseCheckResult, denyList: string[]): string {
  const lines: string[] = [];
  
  // Group by category
  const permissive = result.packages.filter(p => p.category === 'permissive');
  const copyleft = result.packages.filter(p => p.category === 'copyleft');
  const unknown = result.packages.filter(p => p.category === 'unknown');
  
  if (copyleft.length > 0) {
    lines.push('\n⚠️  COPYLEFT LICENSES (Review Required):');
    lines.push('─────────────────────────────────────────');
    copyleft.forEach(pkg => {
      const denied = isDeniedPackage(pkg, denyList);
      const marker = denied ? '🚫' : '⚠️ ';
      lines.push(`${marker} ${pkg.name}@${pkg.version} → ${pkg.license}`);
    });
  }
  
  if (unknown.length > 0) {
    lines.push('\n❓ UNKNOWN/MISSING LICENSES:');
    lines.push('────────────────────────────');
    unknown.forEach(pkg => {
      lines.push(`❓ ${pkg.name}@${pkg.version} → ${pkg.license || 'NONE'}`);
    });
  }
  
  if (permissive.length > 0 && (copyleft.length === 0 && unknown.length === 0)) {
    lines.push('\n✅ All licenses are permissive!');
  }
  
  lines.push('\n' + formatSummary(result));
  
  return lines.join('\n');
}

function isDeniedPackage(pkg: PackageLicense, denyList: string[]): boolean {
  if (!pkg.license) return false;
  const normalized = pkg.license.toLowerCase().trim();
  return denyList.some(denied => normalized.includes(denied.toLowerCase()));
}
