export const name = 'og-image';
export const severity = 'fail';

export function check(page) {
  const tag = page.doc.querySelector('meta[property="og:image" i]');
  const content = tag?.getAttribute('content') ?? '';
  if (!content) {
    return { ok: false, message: 'Missing og:image meta tag' };
  }
  return { ok: true };
}
