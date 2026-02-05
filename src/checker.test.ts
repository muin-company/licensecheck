import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkLicenses } from './checker';
import * as fs from 'fs';
import * as path from 'path';

describe('checkLicenses', () => {
  const testDir = path.join(__dirname, '../test-fixtures');
  const nodeModulesDir = path.join(testDir, 'node_modules');
  
  beforeEach(() => {
    // Create test fixtures
    fs.mkdirSync(nodeModulesDir, { recursive: true });
    
    // MIT package
    const mitPkg = path.join(nodeModulesDir, 'mit-package');
    fs.mkdirSync(mitPkg, { recursive: true });
    fs.writeFileSync(
      path.join(mitPkg, 'package.json'),
      JSON.stringify({ name: 'mit-package', version: '1.0.0', license: 'MIT' })
    );
    
    // GPL package
    const gplPkg = path.join(nodeModulesDir, 'gpl-package');
    fs.mkdirSync(gplPkg, { recursive: true });
    fs.writeFileSync(
      path.join(gplPkg, 'package.json'),
      JSON.stringify({ name: 'gpl-package', version: '2.0.0', license: 'GPL-3.0' })
    );
    
    // No license package
    const noLicensePkg = path.join(nodeModulesDir, 'no-license');
    fs.mkdirSync(noLicensePkg, { recursive: true });
    fs.writeFileSync(
      path.join(noLicensePkg, 'package.json'),
      JSON.stringify({ name: 'no-license', version: '0.1.0' })
    );
  });
  
  afterEach(() => {
    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
  });
  
  it('should scan and categorize licenses', () => {
    const result = checkLicenses(testDir);
    
    expect(result.packages).toHaveLength(3);
    expect(result.summary.permissive).toBe(1);
    expect(result.summary.copyleft).toBe(1);
    expect(result.summary.unknown).toBe(1);
  });
  
  it('should detect denied licenses', () => {
    const result = checkLicenses(testDir, { deny: ['GPL-3.0'] });
    
    expect(result.summary.denied).toBe(1);
    expect(result.hasIssues).toBe(true);
  });
  
  it('should mark as having issues when copyleft found', () => {
    const result = checkLicenses(testDir);
    
    expect(result.hasIssues).toBe(true);
  });
  
  it('should handle empty deny list', () => {
    const result = checkLicenses(testDir, { deny: [] });
    
    expect(result.summary.denied).toBe(0);
  });
});
