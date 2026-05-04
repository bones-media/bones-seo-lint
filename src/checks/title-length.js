export const name = 'title-length';
export const severity = 'fail';

const MAX_CHARS = 200;

export function check(page) {
  const title = page.doc.querySelector('title')?.text?.trim() ?? '';
  if (!title) {
    return { ok: false, message: 'Missing <title>' };
  }
  if (title.length > MAX_CHARS) {
    return {
      ok: false,
      message: `Title is ${title.length} chars (max ${MAX_CHARS}). Google may truncate aggressively.`,
    };
  }
  return { ok: true };
}
