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

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT © MUIN Company

---

**Made with ❤️ by [MUIN Company](https://github.com/muin-company)**

*Part of the MUIN micro-tools ecosystem — small, focused, powerful.*
