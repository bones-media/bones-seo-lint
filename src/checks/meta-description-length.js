export const name = 'meta-description-length';
export const severity = 'fail';

const MAX_CHARS = 155;

export function check(page) {
  const tag = page.doc.querySelector('meta[name="description" i]');
  const content = tag?.getAttribute('content') ?? '';
  if (!content) {
    return { ok: false, message: 'Missing meta description' };
  }
  if (content.length > MAX_CHARS) {
    return {
      ok: false,
      message: `Meta description is ${content.length} chars (max ${MAX_CHARS}). Truncates in SERPs.`,
    };
  }
  return { ok: true };
}
