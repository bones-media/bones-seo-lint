const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

export function formatResults(results) {
  const lines = [];
  const failures = results.filter((r) => !r.ok && r.severity === 'fail');
  const warnings = results.filter((r) => !r.ok && r.severity === 'warn');

  if (failures.length === 0 && warnings.length === 0) {
    lines.push(`${GREEN}✓${RESET} bones-seo-lint: all checks passed (${results.length} run)`);
    return lines.join('\n');
  }

  lines.push(`bones-seo-lint results`);
  lines.push('');

  for (const result of failures) {
    lines.push(`${RED}FAIL${RESET}  ${result.route}  ${DIM}${result.checkName}${RESET}`);
    lines.push(`      ${result.message}`);
  }

  for (const result of warnings) {
    lines.push(`${YELLOW}WARN${RESET}  ${result.route}  ${DIM}${result.checkName}${RESET}`);
    lines.push(`      ${result.message}`);
  }

  lines.push('');
  lines.push(`${failures.length} fail, ${warnings.length} warn, ${results.length} checks total`);
  return lines.join('\n');
}
