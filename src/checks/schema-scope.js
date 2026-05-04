import { isHomepage } from '../html.js';

export const name = 'schema-scope';
export const severity = 'warn';

export function check(page, config) {
  const scripts = page.doc.querySelectorAll('script[type="application/ld+json"]');
  if (scripts.length === 0) {
    if (isHomepage(page)) {
      return { ok: false, message: `Homepage missing ${config.schemaType} JSON-LD` };
    }
    return { ok: true };
  }

  const hasSchemaType = scripts.some((script) => {
    try {
      const json = JSON.parse(script.text);
      return matchesType(json, config.schemaType);
    } catch {
      return false;
    }
  });

  if (!hasSchemaType) {
    if (isHomepage(page)) {
      return { ok: false, message: `Homepage has JSON-LD but no ${config.schemaType} type` };
    }
    return { ok: true };
  }

  if (!isHomepage(page)) {
    return {
      ok: false,
      message: `${config.schemaType} schema appears on a non-homepage route. Per Caleb Ulku, scope this to the homepage only.`,
    };
  }
  return { ok: true };
}

function matchesType(node, type) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some((n) => matchesType(n, type));
  if (node['@type'] === type) return true;
  if (Array.isArray(node['@type']) && node['@type'].includes(type)) return true;
  if (Array.isArray(node['@graph'])) return node['@graph'].some((n) => matchesType(n, type));
  return false;
}
