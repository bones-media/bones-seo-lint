import { loadConfig } from './config.js';
import { collectPages } from './html.js';
import { formatResults } from './format.js';

import * as metaDescriptionLength from './checks/meta-description-length.js';
import * as titleLength from './checks/title-length.js';
import * as ogImage from './checks/og-image.js';
import * as h1Keyword from './checks/h1-keyword.js';
import * as singleH1 from './checks/single-h1.js';
import * as schemaScope from './checks/schema-scope.js';

const CHECKS = [
  metaDescriptionLength,
  titleLength,
  ogImage,
  h1Keyword,
  singleH1,
  schemaScope,
];

export async function run({ dir, cwd }) {
  let config;
  try {
    config = await loadConfig(cwd);
  } catch (err) {
    console.error(`bones-seo-lint: ${err.message}`);
    return 2;
  }

  let pages;
  try {
    pages = await collectPages(dir, cwd);
  } catch (err) {
    console.error(`bones-seo-lint: ${err.message}`);
    return 2;
  }

  if (pages.length === 0) {
    console.error(`bones-seo-lint: no HTML pages found in ${dir}/`);
    return 2;
  }

  const results = [];
  for (const page of pages) {
    for (const checkModule of CHECKS) {
      const result = checkModule.check(page, config);
      results.push({
        ...result,
        checkName: checkModule.name,
        severity: checkModule.severity,
        route: page.route,
        filePath: page.filePath,
      });
    }
  }

  console.log(formatResults(results));

  const hasFails = results.some((r) => !r.ok && r.severity === 'fail');
  return hasFails ? 1 : 0;
}
