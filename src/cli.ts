#!/usr/bin/env node

import { checkLicenses } from './checker';
import { formatJson, formatSummary, formatDetailed } from './formatter';

function parseArgs(): { deny: string[]; json: boolean; summary: boolean; help: boolean } {
  const args = process.argv.slice(2);
  const deny: string[] = [];
  let json = false;
  let summary = false;
  let help = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--summary') {
      summary = true;
    } else if (arg === '--deny') {
      const nextArg = args[++i];
      if (nextArg) deny.push(nextArg);
    }
  }
  
  return { deny, json, summary, help };
}

function printHelp() {
  console.log(`
licensecheck - Scan dependency licenses

USAGE:
  licensecheck [OPTIONS]

OPTIONS:
  --deny <LICENSE>    Fail if this license is found (repeatable)
  --json             Output results as JSON
  --summary          Show summary only
  -h, --help         Show this help message

EXAMPLES:
  licensecheck
  licensecheck --deny GPL-3.0 --deny AGPL-3.0
  licensecheck --json
  licensecheck --summary

EXIT CODES:
  0  No issues found
  1  Issues detected (copyleft, unknown, or denied licenses)
`);
}

function main() {
  const options = parseArgs();
  
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  
  try {
    const result = checkLicenses(process.cwd(), options);
    
    if (options.json) {
      console.log(formatJson(result));
    } else if (options.summary) {
      console.log(formatSummary(result));
    } else {
      console.log(formatDetailed(result, options.deny));
    }
    
    process.exit(result.hasIssues ? 1 : 0);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
