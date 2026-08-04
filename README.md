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
npm test
npm run lint
```

`npm run build` runs the data validator before producing the deployment build. Production dependencies should also remain clean under `npm audit --omit=dev`.

## Vercel deployment

The production build is a static Next.js export written to `out/`. Import
`ForPublicOrg/governmentexamindia` in Vercel and keep the detected framework as
Next.js. Vercel uses the committed `vercel.json`, runs `npm ci` followed by
`npm run build`, and serves the exported pages from its edge network.

Connect `governmentexamindia.com` from **Project settings → Domains** after the
first deployment, then add the DNS records Vercel provides at the domain host.

## Updating data

Exam cycles live in `lib/exams.ts`. Recruiting-body watch pages and official-domain allowlists live in `data/source-registry.json`. See `docs/UPDATING.md` for the review and publication flow.

Useful commands:

- `npm run data:watch`: check registered official pages for a changed fingerprint without editing public records.
- `npm run data:watch -- --write`: update local watcher fingerprints after reviewing the report.
- `npm run map:build`: regenerate the simplified state-map paths from the attributed source geometry.

The public site does not require a database, account system or third-party analytics.

## Licence

Code is available under the [MIT Licence](LICENSE). Map and source data retain
their own licences and terms; map attribution is documented in
`data/geo/ATTRIBUTION.md`, and exam records link to their official sources.
