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

## 📖 Usage

### Basic Scan

```bash
licensecheck
```

Output:

```
⚠️  COPYLEFT LICENSES (Review Required):
─────────────────────────────────────────
⚠️  some-gpl-package@2.0.0 → GPL-3.0

❓ UNKNOWN/MISSING LICENSES:
────────────────────────────
❓ unlicensed-package@1.0.0 → NONE

📊 License Summary
─────────────────
✅ Permissive: 45
⚠️  Copyleft:   1
❓ Unknown:    1
───────────────────
Total packages: 47
```

### Deny Specific Licenses

```bash
licensecheck --deny GPL-3.0 --deny AGPL-3.0
```

Exit code `1` if denied licenses are found.

### JSON Output

```bash
licensecheck --json
```

```json
{
  "packages": [
    {
      "name": "express",
      "version": "4.18.2",
      "license": "MIT",
      "category": "permissive"
    }
  ],
  "summary": {
    "permissive": 45,
    "copyleft": 0,
    "unknown": 0,
    "denied": 0
  },
  "hasIssues": false
}
```

### Summary Only

```bash
licensecheck --summary
```

```
📊 License Summary
─────────────────
✅ Permissive: 45
⚠️  Copyleft:   0
❓ Unknown:    0
───────────────────
Total packages: 45
```

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

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT © MUIN Company

---

**Made with ❤️ by [MUIN Company](https://github.com/muin-company)**

*Part of the MUIN micro-tools ecosystem — small, focused, powerful.*
