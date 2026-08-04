# Government Exam India

A fast public index of Indian central and state government recruitment cycles. The site is static-data-first: search, state/type discovery, exam timelines, vacancy tables and source records are generated from the same reviewed dataset.

## Local development

Requires Node.js 22.

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run data:validate
npm run data:validate:full
npm test
npm run lint
```

`npm run build` requires at least one explicitly tagged state-level cycle for all 36 states and union territories before producing the deployment build. Production dependencies should also remain clean under `npm audit --omit=dev`.

## Vercel deployment

The production build is a static Next.js export written to `out/`. Import
`ForPublicOrg/governmentexamindia` in Vercel and keep the detected framework as
Next.js. Vercel uses the committed `vercel.json`, runs `npm ci` followed by
`npm run build`, and serves the exported pages from its edge network. The public
site uses no server functions, database, image-transformation service or
scheduled Vercel job, so normal traffic consumes static bandwidth only.

Connect `governmentexamindia.com` from **Project settings → Domains** after the
first deployment, then add the DNS records Vercel provides at the domain host.

## Updating data

Exam cycles live in the family modules under `data/exams/` and are aggregated by
`lib/exams.ts`. Recruiting-body watch pages and official-domain allowlists are
generated into `data/source-registry.json`. See `docs/UPDATING.md` for the review
and publication flow.

Useful commands:

- `npm run data:watch`: check registered official pages for a changed fingerprint without editing public records. The scheduled monitor runs once daily and uses ETag/Last-Modified validators when official servers provide them.
- `npm run data:watch -- --write`: update local watcher fingerprints after reviewing the report.
- `npm run map:build`: regenerate the simplified state-map paths from the attributed source geometry.

The public site does not require a database, account system or third-party analytics.

## Licence

Code is available under the [MIT Licence](LICENSE). Map and source data retain
their own licences and terms; map attribution is documented in
`data/geo/ATTRIBUTION.md`, and exam records link to their official sources.
