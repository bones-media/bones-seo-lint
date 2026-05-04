import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONFIG_FILENAME = 'bones-seo.config.json';

const REQUIRED_FIELDS = ['brand', 'primaryKeyword', 'location', 'schemaType'];

const DEFAULTS = {
  secondaryKeywords: [],
  h1KeywordRoutes: ['/'],
};

export async function loadConfig(cwd) {
  const path = join(cwd, CONFIG_FILENAME);
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Missing ${CONFIG_FILENAME} in ${cwd}. See https://github.com/bones-media/bones-seo-lint#configure`);
    }
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${CONFIG_FILENAME} is not valid JSON: ${err.message}`);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!parsed[field] || typeof parsed[field] !== 'string') {
      throw new Error(`${CONFIG_FILENAME} is missing required field: "${field}"`);
    }
  }

  return { ...DEFAULTS, ...parsed };
}
