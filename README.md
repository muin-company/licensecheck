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

## 🚨 Troubleshooting

### Issue: "No package.json found"

**Error:**
```
❌ Error: No package.json found in current directory
```

**Cause:** Running `licensecheck` outside a Node.js project directory.

**Solution:**
```bash
# Navigate to your project root
cd /path/to/your/project

# Verify package.json exists
ls -la package.json

# Run licensecheck
licensecheck
```

---

### Issue: "node_modules not found"

**Error:**
```
❌ Error: node_modules directory not found. Run 'npm install' first.
```

**Cause:** Dependencies haven't been installed yet.

**Solution:**
```bash
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install

# Then run licensecheck
licensecheck
```

---

### Issue: False Positives on Internal Packages

**Problem:** Private monorepo packages flagged as "unknown license".

**Example:**
```
❓ @mycompany/shared-utils@1.0.0 → NONE (private, missing license field)
```

**Solutions:**

**Option 1:** Add `"license": "UNLICENSED"` to private packages:
```json
{
  "name": "@mycompany/shared-utils",
  "version": "1.0.0",
  "private": true,
  "license": "UNLICENSED"
}
```

**Option 2:** Add `"private": true` (automatically treated as UNLICENSED):
```json
{
  "name": "@mycompany/shared-utils",
  "version": "1.0.0",
  "private": true
}
```

**Option 3:** Use your internal license:
```json
{
  "name": "@mycompany/shared-utils",
  "version": "1.0.0",
  "license": "SEE LICENSE IN LICENSE.txt"
}
```

---

### Issue: CI Fails on Transitive Dependencies

**Problem:** A package you depend on has a dependency with GPL license.

**Example:**
```
Project → some-tool@1.0.0 (MIT) → pdf-parser@2.0.0 (GPL-3.0)
```

**Solutions:**

**Option 1:** Find alternative package
```bash
# Search for alternatives
npm search "pdf parser" --filter "license:MIT"

# Check alternatives' licenses
npx @muin-company/licensecheck --json | jq '.packages[] | select(.name | contains("pdf"))'
```

**Option 2:** Contact package maintainer
```bash
# Check if newer version fixes it
npm view some-tool versions
npm install some-tool@latest

# Or open an issue
# "Hey, pdf-parser dependency uses GPL-3.0, consider switching to a permissive alternative"
```

**Option 3:** Fork and patch (last resort)
```bash
# Use patch-package to remove problematic dependency
npm install patch-package
# ... make changes ...
npx patch-package some-tool
```

---

### Issue: SPDX License Expression Not Recognized

**Problem:** Package uses SPDX expression like `(MIT OR Apache-2.0)`.

**Example:**
```
❓ flexible-lib@1.0.0 → (MIT OR Apache-2.0)
```

**Solution:** This is actually fine! Dual-licensed packages give you a choice.

**Explanation:**
- `(MIT OR Apache-2.0)` = You can use under **either** license
- `(MIT AND Apache-2.0)` = You must comply with **both** licenses
- Current version flags these as "unknown" for safety

**Workaround:** Manually verify in CI script:
```bash
#!/bin/bash
licensecheck --json > report.json

# Check if "unknown" licenses are actually dual-licensed
unknown=$(jq -r '.packages[] | select(.category == "unknown") | "\(.name): \(.license)"' report.json)

if echo "$unknown" | grep -q "OR MIT\|MIT OR"; then
  echo "✅ Dual-licensed packages are OK (MIT is an option)"
else
  echo "⚠️ Truly unknown licenses found"
  exit 1
fi
```

---

### Issue: Performance on Large Monorepos

**Problem:** Scanning 10,000+ packages takes too long.

**Solution 1:** Cache results in CI
```yaml
# .github/workflows/license-check.yml
- name: Cache license report
  uses: actions/cache@v3
  with:
    path: .license-cache
    key: licenses-${{ hashFiles('package-lock.json') }}

- name: Check licenses
  run: |
    if [ -f .license-cache/report.json ]; then
      echo "Using cached report"
      cp .license-cache/report.json report.json
    else
      licensecheck --json > report.json
      mkdir -p .license-cache
      cp report.json .license-cache/
    fi
```

**Solution 2:** Scan only production dependencies
```bash
# Temporarily remove devDependencies from node_modules
npm prune --production

# Scan
licensecheck

# Restore
npm install
```

**Solution 3:** Parallelize in monorepos
```bash
# scripts/parallel-license-check.sh
#!/bin/bash

packages=$(find packages -name package.json -not -path "*/node_modules/*")

for pkg in $packages; do
  dir=$(dirname "$pkg")
  (cd "$dir" && licensecheck --json > licenses.json) &
done

wait
echo "✅ All packages scanned"
```

---

### Issue: Different Results on Different Machines

**Cause:** Different `node_modules` contents due to lock file drift.

**Solution:**
```bash
# Delete and reinstall with lock file
rm -rf node_modules
npm ci  # Uses package-lock.json exactly

# Or with yarn
rm -rf node_modules
yarn install --frozen-lockfile

# Then check
licensecheck
```

---

### Issue: License in README but Not package.json

**Problem:** Package has license in README/LICENSE file, but not in `package.json`.

**Example:**
```
❓ old-package@1.0.0 → NONE (missing license field, but has LICENSE file)
```

**Explanation:** `licensecheck` reads `package.json` only (for performance).

**Solutions:**

**Option 1:** Manually verify
```bash
# Check LICENSE file in node_modules
cat node_modules/old-package/LICENSE
```

**Option 2:** Contribute to package
```bash
# Open PR to add license field to package.json
{
  "name": "old-package",
  "license": "MIT"  # ← Add this
}
```

**Option 3:** Document exception
```bash
# Create .licensecheck-exceptions.json
{
  "exceptions": [
    {
      "package": "old-package",
      "reason": "MIT licensed (verified in LICENSE file)",
      "approvedBy": "legal@company.com",
      "approvedDate": "2024-01-15"
    }
  ]
}
```

---

### Issue: NPM Registry vs Git Dependencies

**Problem:** Git dependencies don't have license info in `package.json`.

**Example:**
```json
{
  "dependencies": {
    "custom-lib": "git+https://github.com/company/custom-lib.git#v1.0.0"
  }
}
```

**Result:**
```
❓ custom-lib@1.0.0 → NONE (git dependency)
```

**Solution:** Clone and check manually, or switch to npm registry:
```bash
# Publish to private npm registry
npm publish --registry https://npm.company.com

# Or use local file path
{
  "dependencies": {
    "custom-lib": "file:../custom-lib"
  }
}
```

---

## 🎓 Advanced Usage

### Programmatic API

Use `licensecheck` as a library in your own tools:

```typescript
import { scanLicenses, categorizeLicense } from '@muin-company/licensecheck';

// Scan current project
const result = await scanLicenses(process.cwd());

console.log(`Total packages: ${result.packages.length}`);
console.log(`Copyleft: ${result.summary.copyleft}`);
console.log(`Unknown: ${result.summary.unknown}`);

// Check specific package
const express = result.packages.find(p => p.name === 'express');
console.log(`Express license: ${express?.license}`);

// Categorize a license string
const category = categorizeLicense('GPL-3.0');
console.log(category); // 'copyleft'
```

**Full API Example:**

```typescript
import { scanLicenses, LicenseReport, LicenseCategory } from '@muin-company/licensecheck';

interface LicenseReport {
  packages: Array<{
    name: string;
    version: string;
    license: string | null;
    category: LicenseCategory;
  }>;
  summary: {
    permissive: number;
    copyleft: number;
    unknown: number;
    denied: number;
  };
  hasIssues: boolean;
}

async function customCheck() {
  const report = await scanLicenses('/path/to/project', {
    deny: ['GPL-3.0', 'AGPL-3.0'],
    includeDevDependencies: false
  });

  // Filter high-risk packages
  const risks = report.packages.filter(p => 
    p.category === 'copyleft' || p.category === 'unknown'
  );

  if (risks.length > 0) {
    console.error('⚠️ High-risk licenses found:');
    risks.forEach(pkg => {
      console.error(`  - ${pkg.name}@${pkg.version}: ${pkg.license}`);
    });
    process.exit(1);
  }
}

customCheck();
```

---

### Custom Reporters

Build your own output formats:

```typescript
// reporters/markdown-reporter.ts
import { LicenseReport } from '@muin-company/licensecheck';
import * as fs from 'fs';

export function generateMarkdownReport(report: LicenseReport): string {
  let md = '# License Report\n\n';
  
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  md += '## Summary\n\n';
  md += `- Total Packages: ${report.packages.length}\n`;
  md += `- Permissive: ${report.summary.permissive}\n`;
  md += `- Copyleft: ${report.summary.copyleft}\n`;
  md += `- Unknown: ${report.summary.unknown}\n\n`;
  
  // Group by license
  const grouped = new Map<string, typeof report.packages>();
  for (const pkg of report.packages) {
    const license = pkg.license || 'UNKNOWN';
    if (!grouped.has(license)) grouped.set(license, []);
    grouped.get(license)!.push(pkg);
  }
  
  md += '## License Breakdown\n\n';
  for (const [license, packages] of grouped) {
    md += `### ${license} (${packages.length})\n\n`;
    packages.forEach(p => {
      md += `- ${p.name}@${p.version}\n`;
    });
    md += '\n';
  }
  
  return md;
}

// Usage
import { scanLicenses } from '@muin-company/licensecheck';

const report = await scanLicenses(process.cwd());
const markdown = generateMarkdownReport(report);
fs.writeFileSync('LICENSE-REPORT.md', markdown);
```

---

### Integration with Other Tools

#### Combine with `npm-check-updates`

```bash
#!/bin/bash
# scripts/safe-update.sh

echo "🔍 Checking for updates..."
ncu -u --target minor

echo "📦 Installing updates..."
npm install

echo "🔒 Checking licenses..."
if licensecheck --deny GPL-3.0 --deny AGPL-3.0; then
  echo "✅ Updates are license-safe"
  git add package.json package-lock.json
  git commit -m "chore: safe dependency updates"
else
  echo "❌ Updates introduce problematic licenses"
  git checkout package.json package-lock.json
  npm install
  exit 1
fi
```

#### Combine with `depcheck`

```bash
# Check unused dependencies AND licenses
depcheck && licensecheck
```

#### Combine with `snyk`

```bash
# Security + License compliance
snyk test && licensecheck --deny GPL-3.0
```

---

### Custom License Policies

Create reusable policy files:

```bash
# policies/open-source.policy
# Open Source Project License Policy
# Permissive licenses only

--deny GPL-2.0
--deny GPL-3.0
--deny AGPL-3.0
--deny LGPL-2.0
--deny LGPL-2.1
--deny LGPL-3.0
```

```bash
# policies/commercial.policy
# Commercial Product License Policy
# Ultra-strict - no copyleft at all

--deny GPL-2.0
--deny GPL-3.0
--deny AGPL-3.0
--deny LGPL-2.0
--deny LGPL-2.1
--deny LGPL-3.0
--deny MPL-1.1
--deny MPL-2.0
--deny EPL-1.0
--deny EPL-2.0
--deny OSL-3.0
--deny CDDL-1.0
```

**Usage:**
```bash
# Apply policy
licensecheck $(cat policies/commercial.policy)

# Or via npm script
{
  "scripts": {
    "check:oss": "licensecheck $(cat policies/open-source.policy)",
    "check:commercial": "licensecheck $(cat policies/commercial.policy)"
  }
}
```

---

### Continuous Monitoring

Set up automated daily checks:

```yaml
# .github/workflows/license-monitor.yml
name: Daily License Monitor

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
  workflow_dispatch:  # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check licenses
        id: check
        run: |
          npm ci
          licensecheck --json > current-licenses.json
          
      - name: Compare with baseline
        run: |
          # Download previous report
          gh run download --name license-baseline -D baseline || echo "No baseline"
          
          # Compare
          if [ -f baseline/licenses.json ]; then
            node scripts/compare-licenses.js baseline/licenses.json current-licenses.json
          else
            echo "First run - creating baseline"
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload current as baseline
        uses: actions/upload-artifact@v3
        with:
          name: license-baseline
          path: current-licenses.json
          retention-days: 30
      
      - name: Notify on changes
        if: steps.check.outputs.changed == 'true'
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "📊 License changes detected in ${{ github.repository }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Multi-Language Projects

Handle projects with mixed ecosystems:

```bash
#!/bin/bash
# scripts/check-all-licenses.sh

echo "🔍 Multi-Language License Audit"
echo "==============================="

# Node.js
if [ -f package.json ]; then
  echo ""
  echo "📦 Node.js dependencies:"
  npx @muin-company/licensecheck --summary
fi

# Python
if [ -f requirements.txt ]; then
  echo ""
  echo "🐍 Python dependencies:"
  pip-licenses --summary
fi

# Go
if [ -f go.mod ]; then
  echo ""
  echo "🐹 Go dependencies:"
  go-licenses csv . 2>/dev/null | tail -n +2 | cut -d',' -f3 | sort | uniq -c
fi

# Ruby
if [ -f Gemfile ]; then
  echo ""
  echo "💎 Ruby dependencies:"
  bundle exec license_finder --summary
fi

echo ""
echo "✅ Multi-language audit complete"
```

---

### Generate SBOM (Software Bill of Materials)

Create CycloneDX or SPDX-compliant reports:

```typescript
// scripts/generate-sbom.ts
import { scanLicenses } from '@muin-company/licensecheck';
import * as fs from 'fs';

async function generateSBOM() {
  const report = await scanLicenses(process.cwd());
  
  // CycloneDX format
  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{
        name: '@muin-company/licensecheck',
        version: '1.0.0'
      }]
    },
    components: report.packages.map(pkg => ({
      type: 'library',
      name: pkg.name,
      version: pkg.version,
      licenses: pkg.license ? [{ license: { id: pkg.license } }] : [],
      purl: `pkg:npm/${pkg.name}@${pkg.version}`
    }))
  };
  
  fs.writeFileSync('sbom.json', JSON.stringify(sbom, null, 2));
  console.log('✅ Generated sbom.json (CycloneDX format)');
}

generateSBOM();
```

```json
{
  "scripts": {
    "sbom": "ts-node scripts/generate-sbom.ts"
  }
}
```

---

### License Compatibility Matrix

Check if your project's license is compatible with dependencies:

```typescript
// scripts/check-compatibility.ts
const compatibilityMatrix = {
  'MIT': {
    'MIT': true,
    'Apache-2.0': true,
    'BSD-3-Clause': true,
    'GPL-3.0': false,  // MIT code can't use GPL deps if distributing
    'AGPL-3.0': false
  },
  'Apache-2.0': {
    'MIT': true,
    'Apache-2.0': true,
    'GPL-3.0': false,
    'LGPL-3.0': true  // With care
  },
  'GPL-3.0': {
    'MIT': true,
    'Apache-2.0': true,
    'GPL-3.0': true,
    'GPL-2.0': false  // Incompatible!
  }
};

import { scanLicenses } from '@muin-company/licensecheck';

async function checkCompatibility() {
  const projectLicense = 'MIT';  // Your project's license
  const report = await scanLicenses(process.cwd());
  
  const incompatible = report.packages.filter(pkg => {
    if (!pkg.license) return false;
    return compatibilityMatrix[projectLicense]?.[pkg.license] === false;
  });
  
  if (incompatible.length > 0) {
    console.error(`❌ Incompatible licenses for ${projectLicense} project:`);
    incompatible.forEach(pkg => {
      console.error(`  - ${pkg.name}: ${pkg.license}`);
    });
    process.exit(1);
  }
  
  console.log(`✅ All dependencies compatible with ${projectLicense}`);
}

checkCompatibility();
```

---

## ❓ FAQ

### Q: What's the difference between "copyleft" and "permissive"?

**Permissive licenses** (MIT, Apache, BSD):
- ✅ Use freely in commercial products
- ✅ Modify and redistribute
- ✅ No requirement to open-source your code
- ⚠️ Must include license notice

**Copyleft licenses** (GPL, AGPL):
- ✅ Use freely in open-source projects
- ⚠️ Modifications must be open-sourced under same license
- ❌ Can't include in proprietary software (usually)
- ⚠️ "Viral" - affects your entire codebase

### Q: Is LGPL safe for commercial use?

**It depends:**
- ✅ **Dynamically linking** (e.g., using as npm dependency): Usually OK
- ❌ **Statically linking** (e.g., bundling): Must open-source your code
- ⚠️ **Best practice**: Avoid LGPL in commercial products unless legal review

### Q: Can I use GPL dependencies if my code is also GPL?

**Yes!** GPL dependencies are fine if:
1. Your project is also GPL-licensed
2. You're not distributing proprietary software
3. All derivative works will be open-source

### Q: What if a package has no license?

**Legally:**
- ❌ **No license = All rights reserved** (can't legally use it)
- ⚠️ **Reality**: Many authors just forgot to add license field

**Action:**
1. Open GitHub issue: "Please add license field to package.json"
2. Check if LICENSE file exists in repo
3. Contact author
4. Find alternative package

### Q: Are "dual-licensed" packages safe?

**Yes!** Dual licensing (e.g., `MIT OR Apache-2.0`) lets you choose:
- Pick the license that works for you
- Example: `(MIT OR GPL-3.0)` → Choose MIT for commercial use

### Q: Does this check my code's license?

**No.** `licensecheck` only scans **dependencies** in `node_modules`.

To check your own code's license headers:
```bash
# Use a different tool
npx license-checker-rseidelsohn --onlyAllow "MIT;Apache-2.0"
```

### Q: What about dev dependencies?

**Current behavior:** Scans all dependencies (including dev).

**Why:** Dev tools can have licensing implications (e.g., AGPL build tool).

**To skip dev deps:**
```bash
npm prune --production
licensecheck
npm install  # Restore dev deps
```

### Q: Can I whitelist licenses instead of denying?

**Not directly**, but you can script it:

```bash
#!/bin/bash
allowed="MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC,0BSD"

licensecheck --json > report.json

not_allowed=$(jq -r --arg allowed "$allowed" '
  .packages[] | 
  select(.license != null and ($allowed | split(",") | index(.license) | not)) | 
  "\(.name): \(.license)"
' report.json)

if [ -n "$not_allowed" ]; then
  echo "❌ Non-whitelisted licenses found:"
  echo "$not_allowed"
  exit 1
fi
```

### Q: Does this work with Yarn/PNPM?

**Yes!** As long as `node_modules` is populated:
```bash
# Yarn
yarn install
licensecheck

# PNPM
pnpm install
licensecheck
```

### Q: Can I exclude specific packages?

**Not yet**, but coming soon! For now:

```bash
# Workaround: post-process JSON
licensecheck --json | jq 'del(.packages[] | select(.name == "package-to-ignore"))'
```

### Q: How do I handle corporate proxies?

`licensecheck` reads local `node_modules` only - **no network calls**.

If npm install fails behind proxy:
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
npm install
licensecheck  # Works offline
```

---

## 📚 Further Reading

### License Guides
- [Choose a License](https://choosealicense.com/) - Explains common licenses
- [SPDX License List](https://spdx.org/licenses/) - Official license identifiers
- [TLDRLegal](https://tldrlegal.com/) - Plain English license summaries

### Compliance Tools
- [FOSSA](https://fossa.com/) - Enterprise license compliance
- [Black Duck](https://www.blackducksoftware.com/) - Commercial solution
- [FOSSology](https://www.fossology.org/) - Open source compliance tool

### Legal Resources
- [Open Source Initiative](https://opensource.org/) - License approval body
- [Software Freedom Law Center](https://softwarefreedom.org/)
- [GNU License Compatibility](https://www.gnu.org/licenses/license-compatibility.en.html)

---

## 🔄 Comparison with Alternatives

| Tool | Scope | Output | Speed | Dependencies |
|------|-------|--------|-------|--------------|
| **licensecheck** | npm only | CLI + JSON | Fast | Zero |
| license-checker | npm only | JSON + CSV | Medium | Many |
| license-checker-rseidelsohn | npm + Bower | JSON + CSV + Markdown | Medium | Many |
| FOSSA CLI | Multi-lang | API + Web UI | Slow | Binary |
| license-compliance | npm only | CLI | Fast | Few |

**Why licensecheck?**
- ✅ Zero dependencies (safe to add anywhere)
- ✅ Fast (optimized for CI)
- ✅ Focused (does one thing well)
- ✅ Modern (TypeScript, actively maintained)

---

## 🛣️ Roadmap

- [ ] Whitelist mode (`--allow MIT --allow Apache-2.0`)
- [ ] Exclude packages (`--exclude test-package`)
- [ ] Confidence scoring (package.json vs LICENSE file)
- [ ] SPDX expression parsing (`(MIT OR Apache-2.0)`)
- [ ] License text extraction
- [ ] Multi-language support (Python, Go, Ruby)
- [ ] GitHub Action
- [ ] VS Code extension

---

**Made with ❤️ by [MUIN Company](https://github.com/muin-company)**

*Part of the MUIN micro-tools ecosystem — small, focused, powerful.*
