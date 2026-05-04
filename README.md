# bones-seo-lint

Build-time SEO linter for Bones Media client sites. Reads the static HTML output of a site (default `dist/`) and flags recurring SEO failures that should never make it to production.

## Why this exists

Every site launch surfaces the same handful of SEO issues: meta descriptions too long, titles weak or missing, schema scoped wrong, H1s missing the brand or primary keyword. This linter encodes those checks so they fail at build time instead of being caught manually weeks later.

## Install

```sh
pnpm add -D github:bones-media/bones-seo-lint
```

## Configure

Drop a `bones-seo.config.json` in the project root.

```json
{
  "brand": "Acme Co",
  "primaryKeyword": "service or product keyword",
  "secondaryKeywords": ["adjacent service", "complementary product"],
  "location": "City, ST",
  "schemaType": "LocalBusiness"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `brand` | yes | Used in H1 + title brand checks |
| `primaryKeyword` | yes | Used in H1 keyword check (case-insensitive substring) |
| `secondaryKeywords` | no | Reserved for v0.2 |
| `location` | yes | Reserved for v0.2 entity-signal checks |
| `schemaType` | yes | Schema.org type the homepage should declare and that should NOT appear on inner pages. Be specific: `SportingGoodsStore`, `SportsActivityLocation`, `TravelAgency`, `Store`. Avoid generic `LocalBusiness` if a subtype fits |
| `h1KeywordRoutes` | no | Routes where H1 must contain brand or primary keyword. Defaults to `["/"]` (homepage only). Inner pages have their own narrow topical H1s; demanding the brand or primary keyword on every page is keyword stuffing. Override with the routes you want enforced, e.g. `["/", "/commercial", "/flooring"]` |

## Run

After your build completes:

```sh
npx bones-seo-lint           # checks ./dist
npx bones-seo-lint build     # checks ./build
```

Add to `package.json` for automatic post-build checks:

```json
{
  "scripts": {
    "build": "astro build",
    "postbuild": "bones-seo-lint"
  }
}
```

## Checks

| Check | Severity | What it catches |
|-------|----------|-----------------|
| `meta-description-length` | FAIL | `<meta name="description">` over 155 chars |
| `title-length` | FAIL | Missing `<title>` or over 200 chars |
| `og-image` | FAIL | Missing `<meta property="og:image">` |
| `h1-keyword` | WARN | On routes in `h1KeywordRoutes` (default: homepage only): H1 missing brand or primary keyword |
| `schema-scope` | WARN | Configured schema type appears on more than the homepage |
| `single-h1` | WARN | More than one H1 on a page |

## Exit codes

- `0` — no FAILs
- `1` — at least one FAIL

WARN-only runs still exit 0.
