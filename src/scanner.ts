import * as fs from 'fs';
import * as path from 'path';
import { PackageLicense } from './types';
import { classifyLicense } from './classifier';

export function scanNodeModules(rootDir: string = process.cwd()): PackageLicense[] {
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error(`node_modules not found in ${rootDir}`);
  }
  
  const packages: PackageLicense[] = [];
  const entries = fs.readdirSync(nodeModulesPath);
  
  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    
    // Handle scoped packages (@org/package)
    if (entry.startsWith('@')) {
      const scopePath = path.join(nodeModulesPath, entry);
      if (!fs.statSync(scopePath).isDirectory()) continue;
      
      const scopedPackages = fs.readdirSync(scopePath);
      for (const scopedPkg of scopedPackages) {
        const pkgInfo = readPackageInfo(path.join(scopePath, scopedPkg));
        if (pkgInfo) packages.push(pkgInfo);
      }
    } else {
      const pkgInfo = readPackageInfo(path.join(nodeModulesPath, entry));
      if (pkgInfo) packages.push(pkgInfo);
    }
  }
  
  return packages;
}

function readPackageInfo(pkgPath: string): PackageLicense | null {
  const packageJsonPath = path.join(pkgPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    
    const license = getLicenseFromPackage(pkg);
    
    return {
      name: pkg.name || path.basename(pkgPath),
      version: pkg.version || 'unknown',
      license,
      category: classifyLicense(license),
    };
  } catch (error) {
    return null;
  }
}

function getLicenseFromPackage(pkg: any): string | null {
  if (typeof pkg.license === 'string') {
    return pkg.license;
  }
  
  if (pkg.license && typeof pkg.license === 'object' && pkg.license.type) {
    return pkg.license.type;
  }
  
  if (Array.isArray(pkg.licenses) && pkg.licenses.length > 0) {
    return pkg.licenses[0].type || pkg.licenses[0];
  }
  
  return null;
}
