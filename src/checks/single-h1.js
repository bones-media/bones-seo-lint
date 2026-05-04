export const name = 'single-h1';
export const severity = 'warn';

export function check(page) {
  const h1s = page.doc.querySelectorAll('h1');
  if (h1s.length > 1) {
    return {
      ok: false,
      message: `Page has ${h1s.length} H1 tags (expected 1)`,
    };
  }
  return { ok: true };
}
