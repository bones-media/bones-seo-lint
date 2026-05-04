import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const CONFIG_FILENAME = 'bones-seo.config.json';
const PACKAGE_NAME = 'bones-seo-lint';
const PACKAGE_SPEC = 'github:bones-media/bones-seo-lint';

export async function runInit(argv) {
  const parsed = parseInitArgs(argv);
  if (parsed.error) {
    console.error(`bones-seo-lint init: ${parsed.error}`);
    printUsage();
    return 2;
  }

  const cwd = process.cwd();
  const pkgPath = join(cwd, 'package.json');

  let pkg;
  try {
    pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  } catch (err) {
    console.error(`bones-seo-lint init: cannot read package.json in ${cwd}`);
    console.error(`  ${err.message}`);
    return 2;
  }

  const framework = detectFramework(pkg);
  const dist = parsed.values.dist ?? framework.defaultDist;

  try {
    await writeConfig(cwd, parsed.values, parsed.values.force);
    await updatePackage(pkgPath, pkg, dist);
  } catch (err) {
    console.error(`bones-seo-lint init: ${err.message}`);
    return 2;
  }

  console.log('');
  console.log(`✓ ${CONFIG_FILENAME} written`);
  console.log(`✓ ${PACKAGE_NAME} added to devDependencies (${PACKAGE_SPEC})`);
  console.log(`✓ postbuild script added: bones-seo-lint ${dist}`);
  console.log('');
  console.log(`Detected framework: ${framework.name}`);
  console.log(`Build output dir:  ${dist}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. pnpm install      # fetch the lint from GitHub');
  console.log('  2. pnpm build        # build runs the lint via postbuild');
  console.log('');

  if (framework.name === 'unknown') {
    console.log(`Warning: framework not auto-detected. If "${dist}" is wrong, edit the postbuild script in package.json.`);
  }

  return 0;
}

function parseInitArgs(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        brand: { type: 'string' },
        keyword: { type: 'string' },
        location: { type: 'string' },
        schema: { type: 'string' },
        dist: { type: 'string' },
        force: { type: 'boolean', default: false },
      },
      strict: true,
    });
  } catch (err) {
    return { error: err.message };
  }

  const required = ['brand', 'keyword', 'location', 'schema'];
  for (const flag of required) {
    if (!parsed.values[flag]) {
      return { error: `--${flag} is required` };
    }
  }
  return parsed;
}

function detectFramework(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps.astro) {
    return { name: 'astro', defaultDist: 'dist' };
  }
  if (deps.next) {
    return { name: 'next', defaultDist: 'out' };
  }
  return { name: 'unknown', defaultDist: 'dist' };
}

async function writeConfig(cwd, values, force) {
  const path = join(cwd, CONFIG_FILENAME);
  if (!force) {
    try {
      await access(path);
      throw new Error(`${CONFIG_FILENAME} already exists. Pass --force to overwrite.`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
  const config = {
    brand: values.brand,
    primaryKeyword: values.keyword,
    secondaryKeywords: [],
    location: values.location,
    schemaType: values.schema,
  };
  await writeFile(path, JSON.stringify(config, null, 2) + '\n');
}

async function updatePackage(pkgPath, pkg, dist) {
  const updated = { ...pkg };
  updated.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    [PACKAGE_NAME]: PACKAGE_SPEC,
  };
  updated.scripts = {
    ...(pkg.scripts ?? {}),
    postbuild: `bones-seo-lint ${dist}`,
  };
  await writeFile(pkgPath, JSON.stringify(updated, null, 2) + '\n');
}

function printUsage() {
  console.error('');
  console.error('Usage: bones-seo-lint init --brand <name> --keyword <kw> --location <city, ST> --schema <type> [--dist <dir>] [--force]');
  console.error('');
  console.error('Examples:');
  console.error('  npx github:bones-media/bones-seo-lint init \\');
  console.error('    --brand "Acme Co" --keyword "service kw" --location "Westbrook, ME" --schema "LocalBusiness"');
  console.error('');
}
