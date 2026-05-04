export const name = 'h1-keyword';
export const severity = 'warn';

export function check(page, config) {
  const h1 = page.doc.querySelector('h1')?.text?.trim() ?? '';
  if (!h1) {
    return { ok: false, message: 'No H1 found on page' };
  }

  const haystack = h1.toLowerCase();
  const hasBrand = haystack.includes(config.brand.toLowerCase());
  const hasKeyword = haystack.includes(config.primaryKeyword.toLowerCase());

  if (!hasBrand && !hasKeyword) {
    return {
      ok: false,
      message: `H1 "${h1}" is missing both brand ("${config.brand}") and primary keyword ("${config.primaryKeyword}")`,
    };
  }
  return { ok: true };
}
