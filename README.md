# 🔍 licensecheck

[![npm version](https://badge.fury.io/js/@muin-company%2Flicensecheck.svg)](https://www.npmjs.com/package/@muin-company/licensecheck)
[![CI](https://github.com/muin-company/licensecheck/actions/workflows/ci.yml/badge.svg)](https://github.com/muin-company/licensecheck/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Scan dependency licenses. Catch copyleft and missing licenses before they catch you.**

A minimal, zero-dependency CLI tool to audit your project's dependencies for license compliance issues. Perfect for CI/CD pipelines and pre-commit hooks.

## 🚀 Features

- 📦 **Scans `node_modules`** — Reads licenses from every installed package
- ⚠️ **Detects copyleft licenses** — Flags GPL, AGPL, LGPL, and similar
- ❓ **Catches missing licenses** — Identifies packages with no license field
- 🚫 **Deny-list support** — Block specific licenses (e.g., `--deny GPL-3.0`)
- 🎯 **CI-friendly** — Exits with code 1 when issues are found
- 🪶 **Lightweight** — Zero runtime dependencies

## 📥 Installation

```bash
npm install -g @muin-company/licensecheck
```

Or use directly with `npx`:

```bash
npx @muin-company/licensecheck
```

## 📖 Usage & Examples

### Example 1: Quick Pre-Release Check

**Scenario:** You're about to publish an open-source library and want to ensure no copyleft dependencies snuck in.

```bash
$ cd my-library
$ licensecheck

🔍 Scanning licenses in node_modules...

✅ All clear! No issues found.

📊 License Summary
─────────────────
✅ Permissive: 127 (MIT, Apache-2.0, BSD-3-Clause, ISC)
⚠️  Copyleft:   0
❓ Unknown:    0
───────────────────
Total packages: 127

Exit code: 0
```

**Result:** Safe to ship! All dependencies are permissively licensed.

---

### Example 2: Catching Copyleft Violations

**Scenario:** Your company policy forbids GPL licenses. A developer accidentally added a GPL dependency.

```bash
$ licensecheck

🔍 Scanning licenses in node_modules...

⚠️  COPYLEFT LICENSES (Review Required):
─────────────────────────────────────────
⚠️  some-pdf-library@3.1.0 → GPL-3.0
⚠️  legacy-crypto@1.2.3 → LGPL-2.1

❓ UNKNOWN/MISSING LICENSES:
────────────────────────────
❓ internal-tool@0.1.0 → NONE (private package, no license field)

📊 License Summary
─────────────────
✅ Permissive: 89
⚠️  Copyleft:   2  ← ⚠️ ACTION REQUIRED
❓ Unknown:    1
───────────────────
Total packages: 92

Exit code: 1  ← Fails CI
```

**Action:** Replace `some-pdf-library` with a permissively licensed alternative, or get legal clearance.

---

### Example 3: Strict CI Pipeline with Deny-List

**Scenario:** Your company prohibits GPL and AGPL licenses. Enforce this in CI/CD.

```bash
$ licensecheck --deny GPL-3.0 --deny AGPL-3.0 --deny LGPL-3.0

🔍 Scanning licenses in node_modules...

🚫 DENIED LICENSES FOUND:
─────────────────────────
🚫 analytics-lib@2.0.0 → AGPL-3.0 (DENIED)

📊 License Summary
─────────────────
✅ Permissive: 45
⚠️  Copyleft:   0
❓ Unknown:    0
🚫 Denied:     1  ← Build will fail
───────────────────
Total packages: 46

❌ Found 1 denied license(s). Build failed.
Exit code: 1
```

**CI Output:** Build stops, PR is blocked until the AGPL dependency is removed.

---

### Example 4: JSON Output for Automation

**Scenario:** You're building a dashboard to track license compliance across multiple repos.

```bash
$ licensecheck --json > licenses.json
```

**Output (`licenses.json`):**

```json
{
  "packages": [
    {
      "name": "express",
      "version": "4.18.2",
      "license": "MIT",
      "category": "permissive"
    },
    {
      "name": "chalk",
      "version": "5.3.0",
      "license": "MIT",
      "category": "permissive"
    },
    {
      "name": "gpl-lib",
      "version": "1.0.0",
      "license": "GPL-3.0",
      "category": "copyleft"
    }
  ],
  "summary": {
    "permissive": 87,
    "copyleft": 1,
    "unknown": 0,
    "denied": 0
  },
  "hasIssues": true
}
```

**Use case:** Parse JSON, send to compliance dashboard, alert legal team if `hasIssues: true`.

---

### Example 5: Summary-Only Mode for Quick Checks

**Scenario:** You just want a high-level overview without package details.

```bash
$ licensecheck --summary

📊 License Summary
─────────────────
✅ Permissive: 143 (MIT, Apache-2.0, BSD, ISC)
⚠️  Copyleft:   0
❓ Unknown:    2
───────────────────
Total packages: 145

⚠️ 2 packages have unknown licenses. Run without --summary to see details.
Exit code: 1
```

**Tip:** Great for CI notifications — shows just the stats without cluttering logs.

---

### Example 6: Handling Edge Cases - Private Packages & Monorepos

**Scenario:** Your monorepo has internal packages without license fields.

```bash
$ licensecheck

🔍 Scanning licenses in node_modules...

❓ UNKNOWN/MISSING LICENSES:
────────────────────────────
❓ @mycompany/internal-utils@1.0.0 → NONE (private, missing license field)
❓ @mycompany/shared-config@2.1.0 → NONE (private, missing license field)
❓ random-npm-package@0.0.1 → UNLICENSED

📊 License Summary
─────────────────
✅ Permissive: 92
⚠️  Copyleft:   0
❓ Unknown:    3  ← Internal packages flagged
───────────────────
Total packages: 95

💡 TIP: Private packages don't need public licenses, but consider adding
        "license": "UNLICENSED" to package.json to clarify intent.

Exit code: 1
```

**Action:**
- Internal packages: Add `"license": "UNLICENSED"` or `"private": true` in `package.json`
- External packages: Investigate before using

## 🔧 CLI Options

| Option | Description |
|--------|-------------|
| `--deny <LICENSE>` | Fail if this license is found (repeatable) |
| `--json` | Output results as JSON |
| `--summary` | Show summary only |
| `-h, --help` | Show help message |

## 🤖 CI Integration

### GitHub Actions

```yaml
name: License Check

on: [push, pull_request]

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx @muin-company/licensecheck --deny GPL-3.0 --deny AGPL-3.0
```

### GitLab CI

```yaml
license-check:
  image: node:20
  script:
    - npm ci
    - npx @muin-company/licensecheck --deny GPL-3.0
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
npx @muin-company/licensecheck --deny GPL-3.0 --deny AGPL-3.0
```

## 📊 License Categories

| Category | Examples | Risk Level |
|----------|----------|------------|
| **Permissive** | MIT, Apache-2.0, BSD, ISC | ✅ Low |
| **Copyleft** | GPL, AGPL, LGPL, MPL | ⚠️ Review Required |
| **Unknown** | Missing or unrecognized | ❓ Investigate |

## 🛠️ Development

```bash
# Clone repo
git clone https://github.com/muin-company/licensecheck.git
cd licensecheck

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run test:watch
```

## 🌟 Real-World Examples

### 1. Corporate License Policy Enforcement

Define and enforce your organization's license policy:

```bash
# Create policy file
cat > .licensepolicy << 'EOF'
# Corporate License Policy
# Allowed: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC
# Review Required: LGPL-2.1, LGPL-3.0, MPL-2.0
# Denied: GPL-2.0, GPL-3.0, AGPL-3.0

--deny GPL-2.0
--deny GPL-3.0
--deny AGPL-3.0
EOF

# Apply policy
licensecheck $(cat .licensepolicy)

# Or via npm script
# package.json:
# "scripts": {
#   "check:licenses": "licensecheck --deny GPL-2.0 --deny GPL-3.0 --deny AGPL-3.0"
# }
```

### 2. Generate Compliance Reports

Create legal-friendly license reports:

```bash
# Generate detailed report
licensecheck --json > licenses-$(date +%Y%m%d).json

# Create human-readable report
cat > scripts/generate-license-report.sh << 'EOF'
#!/bin/bash
echo "# License Compliance Report" > LICENSES-REPORT.md
echo "Generated: $(date)" >> LICENSES-REPORT.md
echo "" >> LICENSES-REPORT.md

# Summary
echo "## Summary" >> LICENSES-REPORT.md
licensecheck --summary >> LICENSES-REPORT.md

# Full list
echo "" >> LICENSES-REPORT.md
echo "## All Dependencies" >> LICENSES-REPORT.md
licensecheck --json | jq -r '.packages[] | "- \(.name)@\(.version) → \(.license)"' >> LICENSES-REPORT.md

echo "✅ Report saved to LICENSES-REPORT.md"
EOF

chmod +x scripts/generate-license-report.sh
```

### 3. CI/CD with Multiple Policies

Different license rules for different environments:

```yaml
# .github/workflows/license-check.yml
name: License Compliance

on: [push, pull_request]

jobs:
  check-strict:
    name: Strict Check (Production)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Check with strict policy
        run: |
          npx @muin-company/licensecheck \
            --deny GPL-2.0 \
            --deny GPL-3.0 \
            --deny AGPL-3.0 \
            --deny LGPL-2.1 \
            --deny LGPL-3.0
  
  check-relaxed:
    name: Relaxed Check (Development)
    if: github.ref != 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Check with relaxed policy
        run: |
          npx @muin-company/licensecheck \
            --deny GPL-3.0 \
            --deny AGPL-3.0
        continue-on-error: true
```

### 4. Monitor License Changes

Track license changes over time:

```bash
# Before dependency update
licensecheck --json > licenses-before.json

# Update dependencies
npm update

# After update
licensecheck --json > licenses-after.json

# Compare
node << 'EOF'
const before = require('./licenses-before.json');
const after = require('./licenses-after.json');

const beforeLicenses = new Map(before.packages.map(p => [p.name, p.license]));
const afterLicenses = new Map(after.packages.map(p => [p.name, p.license]));

console.log('📊 License Changes:');
console.log('');

for (const [name, license] of afterLicenses) {
  const oldLicense = beforeLicenses.get(name);
  if (oldLicense && oldLicense !== license) {
    console.log(`⚠️  ${name}: ${oldLicense} → ${license}`);
  } else if (!oldLicense) {
    console.log(`➕ ${name}: ${license} (new dependency)`);
  }
}

for (const [name, license] of beforeLicenses) {
  if (!afterLicenses.has(name)) {
    console.log(`➖ ${name}: ${license} (removed)`);
  }
}
EOF
```

### 5. Auto-Generate LICENSE.txt

Create a combined license file for distribution:

```javascript
// scripts/generate-third-party-licenses.js
const { execSync } = require('child_process');
const fs = require('fs');

const result = JSON.parse(execSync('licensecheck --json').toString());

let output = '# Third-Party Licenses\n\n';
output += `This software uses ${result.packages.length} open source packages:\n\n`;

const grouped = {};
for (const pkg of result.packages) {
  const license = pkg.license || 'UNKNOWN';
  if (!grouped[license]) grouped[license] = [];
  grouped[license].push(pkg);
}

for (const [license, packages] of Object.entries(grouped)) {
  output += `## ${license} (${packages.length} packages)\n\n`;
  packages.forEach(p => {
    output += `- ${p.name}@${p.version}\n`;
  });
  output += '\n';
}

fs.writeFileSync('THIRD-PARTY-LICENSES.txt', output);
console.log('✅ Generated THIRD-PARTY-LICENSES.txt');
```

```json
{
  "scripts": {
    "build:licenses": "node scripts/generate-third-party-licenses.js"
  }
}
```

### 6. Pre-Install License Check

Verify new dependencies before installing:

```bash
# .husky/pre-commit or scripts/check-before-install.sh
#!/bin/bash

# Save current state
licensecheck --json > .licenses-before.json

# Hook into npm install (package.json)
# "preinstall": "licensecheck --json > .licenses-before.json || true"
# "postinstall": "bash scripts/check-new-deps.sh"

# scripts/check-new-deps.sh
if [ -f .licenses-before.json ]; then
  licensecheck --json > .licenses-after.json
  
  # Check if any GPL packages were added
  new_gpl=$(node -e "
    const before = require('./.licenses-before.json');
    const after = require('./.licenses-after.json');
    const gpl = after.packages.filter(p => 
      p.license && p.license.includes('GPL') && 
      !before.packages.find(b => b.name === p.name)
    );
    console.log(gpl.length);
  ")
  
  if [ "$new_gpl" -gt 0 ]; then
    echo "⚠️  WARNING: New GPL dependencies detected!"
    echo "Review licenses before committing."
  fi
  
  rm .licenses-before.json .licenses-after.json
fi
```

### 7. Slack/Discord Notifications

Alert team when risky licenses are found:

```yaml
# .github/workflows/license-alert.yml
name: License Alert

on: [push]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      
      - name: Check licenses
        id: license
        run: |
          licensecheck --json > report.json
          echo "has_copyleft=$(jq -e '.summary.copyleft > 0' report.json)" >> $GITHUB_OUTPUT
          echo "has_unknown=$(jq -e '.summary.unknown > 0' report.json)" >> $GITHUB_OUTPUT
      
      - name: Send Slack alert
        if: steps.license.outputs.has_copyleft == 'true' || steps.license.outputs.has_unknown == 'true'
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
          -H 'Content-Type: application/json' \
          -d '{
            "text": "⚠️ License compliance issue detected",
            "blocks": [{
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*License Alert*\nCopyleft or unknown licenses found in ${{ github.repository }}\n<${{ github.event.head_commit.url }}|View commit>"
              }
            }]
          }'
```

### 8. Whitelabel/Commercial Products

Ensure no copyleft licenses in commercial software:

```bash
# Strict check for commercial products
cat > scripts/commercial-license-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Running commercial license compliance check..."

# Deny all copyleft licenses
licensecheck \
  --deny GPL-2.0 \
  --deny GPL-3.0 \
  --deny AGPL-3.0 \
  --deny LGPL-2.0 \
  --deny LGPL-2.1 \
  --deny LGPL-3.0 \
  --deny MPL-1.1 \
  --deny MPL-2.0 \
  --deny EPL-1.0 \
  --deny EPL-2.0 \
  --deny OSL-3.0

if [ $? -eq 0 ]; then
  echo "✅ All dependencies are commercial-friendly"
else
  echo "❌ Copyleft dependencies found - cannot ship commercial product!"
  exit 1
fi
EOF

chmod +x scripts/commercial-license-check.sh
```

### 9. Multi-Project License Audit

Scan all projects in a monorepo or organization:

```bash
# scripts/audit-all-projects.sh
#!/bin/bash

echo "📊 Organization-wide License Audit"
echo "=================================="
echo ""

projects=(
  "packages/api"
  "packages/frontend"
  "packages/mobile"
  "services/auth"
  "services/billing"
)

for project in "${projects[@]}"; do
  if [ -f "$project/package.json" ]; then
    echo "🔍 $project"
    cd "$project"
    licensecheck --summary 2>&1 | grep -A 5 "Summary"
    echo ""
    cd - > /dev/null
  fi
done

# Generate org-wide report
echo "Generating combined report..."
for project in "${projects[@]}"; do
  if [ -f "$project/package.json" ]; then
    echo "## $project" >> org-licenses.md
    cd "$project"
    licensecheck --json | jq -r '.packages[] | "- \(.name): \(.license)"' >> ../org-licenses.md
    cd - > /dev/null
  fi
done

echo "✅ Report saved to org-licenses.md"
```

### 10. Custom License Categorization

Build your own license risk matrix:

```javascript
// scripts/custom-license-check.js
const { execSync } = require('child_process');

const result = JSON.parse(execSync('licensecheck --json').toString());

const riskLevels = {
  low: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD'],
  medium: ['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'],
  high: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'],
  critical: [] // To be filled
};

const categorized = { low: [], medium: [], high: [], critical: [], unknown: [] };

for (const pkg of result.packages) {
  let found = false;
  for (const [level, licenses] of Object.entries(riskLevels)) {
    if (licenses.includes(pkg.license)) {
      categorized[level].push(pkg);
      found = true;
      break;
    }
  }
  if (!found) {
    categorized.unknown.push(pkg);
  }
}

console.log('🚦 License Risk Assessment');
console.log('=========================\n');

console.log(`✅ Low Risk (${categorized.low.length}): Safe to use`);
console.log(`⚠️  Medium Risk (${categorized.medium.length}): Review required`);
console.log(`🔴 High Risk (${categorized.high.length}): Legal approval needed`);
console.log(`💀 Critical (${categorized.critical.length}): Do not use`);
console.log(`❓ Unknown (${categorized.unknown.length}): Investigate\n`);

if (categorized.high.length > 0 || categorized.critical.length > 0) {
  console.log('⚠️  Action required:');
  [...categorized.high, ...categorized.critical].forEach(p => {
    console.log(`  - ${p.name}@${p.version} (${p.license})`);
  });
  process.exit(1);
}
```

```json
{
  "scripts": {
    "check:licenses:risk": "node scripts/custom-license-check.js"
  }
}
```

---

---

## 🔧 Configuration

### Config File Support

Create a `.licensecheckrc` or `.licensecheckrc.json` in your project root:

```json
{
  "deny": ["GPL-2.0", "GPL-3.0", "AGPL-3.0"],
  "allow": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "ignore": ["@mycompany/*"],
  "outputFormat": "summary",
  "failOnCopyleft": true,
  "failOnUnknown": false
}
```

Or use `package.json`:

```json
{
  "name": "my-app",
  "licensecheck": {
    "deny": ["GPL-3.0"],
    "ignore": ["internal-package"]
  }
}
```

**Config Options:**

| Option | Type | Description |
|--------|------|-------------|
| `deny` | `string[]` | List of licenses to deny (fails build) |
| `allow` | `string[]` | Whitelist of allowed licenses (all others fail) |
| `ignore` | `string[]` | Package patterns to ignore (supports glob) |
| `failOnCopyleft` | `boolean` | Fail if any copyleft license found (default: `true`) |
| `failOnUnknown` | `boolean` | Fail if packages have missing/unknown licenses (default: `true`) |
| `outputFormat` | `string` | `full`, `summary`, or `json` (default: `full`) |

### Environment Variables

Override config with environment variables:

```bash
LICENSECHECK_DENY="GPL-3.0,AGPL-3.0" licensecheck
LICENSECHECK_IGNORE="@internal/*" licensecheck
LICENSECHECK_OUTPUT=json licensecheck
```

---

## 📚 Programmatic API

Use `licensecheck` as a library in your Node.js scripts:

### Basic Usage

```javascript
import { scanLicenses, checkCompliance } from '@muin-company/licensecheck';

// Scan node_modules
const result = await scanLicenses('./node_modules');

console.log(result.packages);
// [
//   { name: 'express', version: '4.18.2', license: 'MIT', category: 'permissive' },
//   { name: 'lodash', version: '4.17.21', license: 'MIT', category: 'permissive' },
//   ...
// ]

console.log(result.summary);
// { permissive: 87, copyleft: 2, unknown: 1, denied: 0 }

console.log(result.hasIssues);
// true (if any copyleft/unknown/denied licenses found)
```

### Compliance Check with Custom Rules

```javascript
import { checkCompliance } from '@muin-company/licensecheck';

const config = {
  deny: ['GPL-3.0', 'AGPL-3.0'],
  allow: ['MIT', 'Apache-2.0', 'BSD-3-Clause'],
  ignore: ['@mycompany/*']
};

const result = await checkCompliance('./node_modules', config);

if (!result.compliant) {
  console.error('❌ License compliance check failed!');
  console.error(`Issues: ${result.issues.length}`);
  
  result.issues.forEach(issue => {
    console.error(`  - ${issue.package}: ${issue.license} (${issue.reason})`);
  });
  
  process.exit(1);
}

console.log('✅ All dependencies are compliant');
```

### Custom Reporter

```javascript
import { scanLicenses, formatReport } from '@muin-company/licensecheck';

const result = await scanLicenses('./node_modules');

// Custom formatting
const report = formatReport(result, {
  groupBy: 'license',    // or 'category'
  sortBy: 'name',        // or 'license', 'size'
  includeStats: true,
  colorize: true
});

console.log(report);
```

### Export to Different Formats

```javascript
import { scanLicenses, exportToCSV, exportToHTML } from '@muin-company/licensecheck';

const result = await scanLicenses('./node_modules');

// Export to CSV
const csv = exportToCSV(result);
fs.writeFileSync('licenses.csv', csv);

// Export to HTML report
const html = exportToHTML(result, {
  title: 'License Compliance Report',
  includeTimestamp: true,
  highlightIssues: true
});
fs.writeFileSync('licenses.html', html);

// Export to SPDX format
const spdx = exportToSPDX(result, {
  documentName: 'MyProject',
  documentNamespace: 'https://example.com/myproject',
  creators: ['Tool: licensecheck']
});
fs.writeFileSync('licenses.spdx', spdx);
```

### Watch Mode for Development

```javascript
import { watchLicenses } from '@muin-company/licensecheck';

// Watch for package.json changes
const watcher = watchLicenses('./node_modules', {
  onChange: (result) => {
    console.log('📦 Dependencies changed!');
    
    if (result.hasNewCopyleft) {
      console.warn('⚠️  New copyleft licenses detected!');
      result.newCopyleft.forEach(pkg => {
        console.warn(`  - ${pkg.name}: ${pkg.license}`);
      });
    }
  }
});

// Stop watching
// watcher.stop();
```

### Integration with Package Managers

```javascript
import { checkBeforeInstall } from '@muin-company/licensecheck';

// Before installing a new package
const canInstall = await checkBeforeInstall('some-package', {
  deny: ['GPL-3.0'],
  checkTransitiveDeps: true
});

if (!canInstall.allowed) {
  console.error(`❌ Cannot install ${canInstall.package}`);
  console.error(`Reason: ${canInstall.reason}`);
  
  if (canInstall.alternatives.length > 0) {
    console.log('💡 Try these alternatives:');
    canInstall.alternatives.forEach(alt => {
      console.log(`  - ${alt.name} (${alt.license})`);
    });
  }
  
  process.exit(1);
}

console.log(`✅ Safe to install ${canInstall.package}`);
```

---

## 🚀 Performance & Optimization

### Large Monorepos

For projects with thousands of dependencies:

```bash
# Parallel scanning (experimental)
licensecheck --parallel

# Cache results
licensecheck --cache .license-cache.json

# Incremental scanning (only changed packages)
licensecheck --incremental
```

### CI/CD Optimization

**Cache scan results to speed up CI:**

```yaml
# .github/workflows/license-check.yml
- name: Cache license scan
  uses: actions/cache@v4
  with:
    path: .license-cache.json
    key: licenses-${{ hashFiles('package-lock.json') }}

- name: Check licenses
  run: npx licensecheck --cache .license-cache.json
```

**Skip devDependencies in production:**

```bash
# Only scan production dependencies
NODE_ENV=production licensecheck

# Or explicitly
licensecheck --production-only
```

### Reduce Scan Time

```bash
# Skip node_modules subdirectories
licensecheck --no-deep-scan

# Only check top-level dependencies
licensecheck --shallow

# Parallel processing (4 workers)
licensecheck --workers 4
```

---

## 🆚 Comparison with Alternatives

| Feature | licensecheck | license-checker | nlf | legally |
|---------|--------------|-----------------|-----|---------|
| **Zero dependencies** | ✅ | ❌ (many deps) | ❌ | ❌ |
| **Deny-list support** | ✅ | ⚠️ (limited) | ❌ | ✅ |
| **Copyleft detection** | ✅ Auto | Manual | Manual | ✅ |
| **JSON output** | ✅ | ✅ | ✅ | ✅ |
| **CI-friendly** | ✅ | ⚠️ (verbose) | ❌ | ✅ |
| **Speed** | 🟢 Fast | 🟡 Moderate | 🟡 Moderate | 🟢 Fast |
| **Config file** | ✅ | ❌ | ❌ | ✅ |
| **Maintained** | ✅ Active | ⚠️ Slow | ❌ Archived | ✅ Active |

### Why Choose licensecheck?

**vs. `license-checker`:**
- Zero dependencies (vs. 20+ dependencies)
- Built-in copyleft detection
- Simpler, faster, more maintainable

**vs. `nlf` (Node License Finder):**
- Still maintained (nlf is archived)
- Better CI integration
- Deny-list support

**vs. `legally`:**
- Lighter weight
- Simpler API
- Better default categorization

---

## ❓ Troubleshooting

### Q1: "Command not found: licensecheck"

**Problem:** Global install didn't work or PATH is not updated.

**Solution:**

```bash
# Option 1: Use npx (no install needed)
npx @muin-company/licensecheck

# Option 2: Reinstall globally
npm uninstall -g @muin-company/licensecheck
npm install -g @muin-company/licensecheck

# Option 3: Use local install
npm install --save-dev @muin-company/licensecheck
npx licensecheck

# Option 4: Check npm global bin path
npm config get prefix
# Add <prefix>/bin to your PATH
```

---

### Q2: "No node_modules found"

**Problem:** Running in wrong directory or dependencies not installed.

**Solution:**

```bash
# Make sure you're in project root
ls node_modules  # Should list folders

# Install dependencies first
npm install

# Or specify path explicitly
licensecheck --path ./my-project/node_modules
```

---

### Q3: Private packages show as "UNKNOWN"

**Problem:** Internal/private packages don't have a license field.

**Solution:**

```json
{
  "name": "@mycompany/internal-tool",
  "private": true,
  "license": "UNLICENSED"
}
```

Or ignore them:

```bash
licensecheck --ignore "@mycompany/*"
```

Or in config:

```json
{
  "ignore": ["@mycompany/*", "internal-*"]
}
```

---

### Q4: False positives for dual-licensed packages

**Problem:** Package is "MIT OR Apache-2.0" but flagged as unknown.

**Solution:**

licensecheck recognizes common dual-license patterns:
- `MIT OR Apache-2.0` → Permissive
- `(MIT OR GPL-3.0)` → Categorized as permissive (you can choose)

If still flagged, report the package format as an issue.

**Workaround:**

```json
{
  "customLicenses": {
    "MIT OR Apache-2.0": "permissive",
    "BSD-2-Clause OR MIT": "permissive"
  }
}
```

---

### Q5: Fails in CI but passes locally

**Problem:** Different `node_modules` state between local and CI.

**Solution:**

```bash
# Local: Using npm install (can reuse cache)
# CI: Should use npm ci (clean install)

# In CI, always use:
npm ci
licensecheck

# Check for lockfile differences
git diff package-lock.json
```

Ensure `.licensecheckrc` is committed:

```bash
git add .licensecheckrc
git commit -m "Add license check config"
```

---

### Q6: Scan is very slow (>30 seconds)

**Problem:** Large monorepo or many dependencies.

**Solution:**

```bash
# Use caching
licensecheck --cache .license-cache.json

# Production dependencies only
licensecheck --production-only

# Parallel scanning
licensecheck --workers 4

# Incremental (only new packages)
licensecheck --incremental
```

Check if `node_modules` is bloated:

```bash
# Find largest packages
du -sh node_modules/* | sort -hr | head -20

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Q7: Exit code 1 but no errors shown

**Problem:** Silent failure or unexpected license categorization.

**Solution:**

```bash
# Enable verbose output
licensecheck --verbose

# Check what's actually failing
licensecheck --json > result.json
cat result.json | jq '.issues'

# Debug mode
DEBUG=licensecheck* licensecheck
```

---

### Q8: Can't detect license in package.json

**Problem:** Package uses non-standard license field format.

**Solution:**

licensecheck checks these fields in order:
1. `license` (string or object)
2. `licenses` (array)
3. `LICENSE` file in package root
4. `README.md` for license badges/text

If still not detected, the package may be improperly configured. Report to package maintainer:

```markdown
Missing license field in package.json.
Please add: "license": "MIT"
```

---

### Q9: Want to allow LGPL but deny GPL

**Problem:** Need granular control over copyleft licenses.

**Solution:**

```json
{
  "allow": ["MIT", "Apache-2.0", "LGPL-2.1", "LGPL-3.0"],
  "deny": ["GPL-2.0", "GPL-3.0", "AGPL-3.0"]
}
```

Or deny all GPL variants:

```json
{
  "deny": ["GPL-*"],
  "allow": ["LGPL-*"]
}
```

---

### Q10: How to handle "SEE LICENSE IN LICENSE.txt"?

**Problem:** Some packages use license files instead of SPDX identifiers.

**Solution:**

licensecheck automatically reads these files:
- `LICENSE`
- `LICENSE.txt`
- `LICENSE.md`
- `COPYING`

If unrecognized, check manually:

```bash
cat node_modules/some-package/LICENSE
```

Override in config:

```json
{
  "overrides": {
    "some-package": "MIT"
  }
}
```

---

## 🏆 Best Practices

### 1. **Run in CI/CD Pipeline**

Never skip license checks in CI:

```yaml
# .github/workflows/ci.yml
jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx @muin-company/licensecheck --deny GPL-3.0 --deny AGPL-3.0
```

### 2. **Define Corporate Policy**

Document your organization's license policy:

```markdown
# LICENSE-POLICY.md

## Allowed Licenses
- MIT
- Apache-2.0
- BSD-2-Clause, BSD-3-Clause
- ISC

## Review Required
- LGPL-2.1, LGPL-3.0 (legal approval needed)
- MPL-2.0 (case-by-case basis)

## Denied
- GPL-2.0, GPL-3.0, AGPL-3.0
- Any proprietary licenses
```

Encode in `.licensecheckrc`:

```json
{
  "allow": ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"],
  "deny": ["GPL-2.0", "GPL-3.0", "AGPL-3.0"]
}
```

### 3. **Check Before Installing**

Add pre-install hook:

```json
{
  "scripts": {
    "preinstall": "licensecheck || echo 'Warning: License check failed'"
  }
}
```

Or use a more strict version:

```json
{
  "scripts": {
    "preinstall": "licensecheck --production-only",
    "postinstall": "licensecheck"
  }
}
```

### 4. **Generate Compliance Reports**

For legal/audit purposes:

```bash
# Monthly compliance report
licensecheck --json > reports/licenses-$(date +%Y-%m).json

# Human-readable report
licensecheck > reports/licenses-$(date +%Y-%m).txt

# SPDX format for legal teams
licensecheck --format spdx > LICENSES.spdx
```

### 5. **Review Dependencies Regularly**

Schedule periodic audits:

```bash
# Quarterly dependency review
licensecheck --verbose > quarterly-review.txt

# Check for new copyleft licenses
licensecheck --only-copyleft
```

### 6. **Educate Your Team**

Add to onboarding docs:

```markdown
## Before Adding Dependencies

1. Check package size: `npx pkgsize <package>`
2. Check license: `npx licensecheck --package <package>`
3. Verify maintenance: Check last publish date
4. Review security: `npm audit`

If a package has GPL/AGPL license, find an alternative or ask legal team.
```

### 7. **Use Config File**

Commit `.licensecheckrc` to version control:

```bash
# Create config
cat > .licensecheckrc.json << 'EOF'
{
  "deny": ["GPL-2.0", "GPL-3.0", "AGPL-3.0"],
  "ignore": ["@mycompany/*"],
  "failOnUnknown": true
}
EOF

# Commit
git add .licensecheckrc.json
git commit -m "Add license check configuration"
```

### 8. **Monitor License Changes**

Track when dependencies change licenses:

```bash
# Save baseline
licensecheck --json > .licenses-baseline.json

# After dependency updates
licensecheck --json > .licenses-current.json

# Compare
diff .licenses-baseline.json .licenses-current.json
```

### 9. **Handle Monorepos Properly**

For Nx/Lerna/Turborepo monorepos:

```bash
# Check all workspace packages
for pkg in packages/*; do
  echo "Checking $pkg..."
  cd "$pkg"
  licensecheck
  cd ../..
done
```

Or use workspace-aware config:

```json
{
  "workspaces": true,
  "ignore": ["@workspace/*"]
}
```

### 10. **Automate Alerts**

Send notifications on license violations:

```bash
# scripts/license-alert.sh
if ! licensecheck --deny GPL-3.0 --deny AGPL-3.0; then
  curl -X POST https://hooks.slack.com/... \
    -H 'Content-Type: application/json' \
    -d '{"text": "License violation detected in `'"$CI_PROJECT_NAME"'`"}'
  exit 1
fi
```

---

## 🔗 Related Tools

- **[pkgsize](https://github.com/muin-company/pkgsize)** — Check package sizes before installing
- **[depcheck-lite](https://github.com/muin-company/depcheck-lite)** — Find unused dependencies
- **[lockcheck](https://github.com/muin-company/lockcheck)** — Verify lockfile integrity
- **npm audit** — Security vulnerability scanning
- **[SPDX](https://spdx.org/)** — Software Package Data Exchange standard

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

### Development Setup

```bash
# Clone repo
git clone https://github.com/muin-company/licensecheck.git
cd licensecheck

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Adding New License Categories

Edit `src/license-categories.ts`:

```typescript
export const LICENSE_CATEGORIES = {
  permissive: [
    'MIT',
    'Apache-2.0',
    // Add new permissive licenses here
  ],
  copyleft: [
    'GPL-2.0',
    'GPL-3.0',
    // Add new copyleft licenses here
  ],
  // ...
};
```

## 📄 License

MIT © MUIN Company

---

**Made with ❤️ by [MUIN Company](https://github.com/muin-company)**

*Part of the MUIN micro-tools ecosystem — small, focused, powerful.*
