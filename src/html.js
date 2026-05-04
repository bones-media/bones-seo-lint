import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';

export async function collectPages(dir, cwd) {
  const root = join(cwd, dir);
  let exists;
  try {
    exists = await stat(root);
  } catch {
    throw new Error(`Build directory not found: ${root}. Did the build complete?`);
  }
  if (!exists.isDirectory()) {
    throw new Error(`Expected directory at ${root}`);
  }

  const htmlFiles = await walk(root);
  const pages = [];
  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf8');
    const doc = parse(html);
    const route = toRoute(filePath, root);
    pages.push({ filePath: relative(cwd, filePath), route, doc });
  }
  return pages;
}

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toRoute(filePath, root) {
  const rel = relative(root, filePath);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}

export function isHomepage(page) {
  return page.route === '/';
}
