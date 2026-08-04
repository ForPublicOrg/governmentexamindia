# Exam data contract

Every recruitment cycle lives in exactly one module under `data/exams/`. A
module has one owner so parallel data work does not collide.

## The honesty rule

Candidates use these records to decide whether to apply. Never invent a date,
vacancy count, fee, age limit, qualification or status. If the current cycle
has not published a fact, say so.

| `verification` | Meaning | Dates | Vacancies |
| --- | --- | --- | --- |
| `verified` | Facts were read from a dated, cycle-specific official notice, corrigendum, result or calendar entry. | Include only dates the source publishes. | Include a number only when the source publishes it. |
| `listed` | The recruitment series and official body are confirmed, but the current cycle is not announced in enough detail. | An empty timeline or clearly undated stages are valid. | Must remain `Not announced`; numeric fields are forbidden. |

Unknown stages do not need fake sort dates. Write either an empty timeline or
an undated event:

```ts
timeline: [
  { label: "Notification", displayDate: "To be announced", state: "tentative" },
]
```

Undated stages appear on the detail page but are excluded from the calendar.

## Use the safe factories

Use `exam(...)` for a verified cycle. Use `listedExam(...)` for a known series
whose current cycle has not published details. `listedExam` deliberately
defaults the timeline to empty and uses honest unknown wording for vacancies,
age, qualification, fee, pay, eligibility, selection stages and syllabus.

```ts
listedExam({
  slug: "example-service-next-cycle",
  title: "Example Service Examination - Next Cycle",
  shortTitle: "Example Service",
  organisation: "Example Public Service Commission",
  governmentLevel: "State",
  jurisdiction: "Example State",
  state: "Example State",
  stateCode: "EX",
  regionCodes: ["EX"],
  cycle: "Next cycle",
  year: 2027,
  sector: "State services",
  examTypes: ["Civil Services & Administration"],
  education: ["Graduate"],
  status: {
    label: "Notification awaited",
    tone: "amber",
    nextAction: "Wait for the official notification",
    detail: "No current-cycle schedule or vacancy count is published.",
  },
  summary: "Recruitment for state services when the next notice is published.",
  officialLinks: [
    { label: "Official website", url: "https://example.gov.in/", type: "website" },
  ],
  sourceTitle: "Official recruitment website",
  sourceUrl: "https://example.gov.in/",
  sourcePublished: "Recruitment index checked 4 Aug 2026",
  lastVerified: "4 Aug 2026, 12:00 IST",
})
```

The example region code and domain are illustrative only. Real records must
use a code from `lib/discovery.ts` and a verified official domain.

## Sources and authorities

- Use only official government hosts (`*.gov.in`, `*.nic.in`, `pib.gov.in`) or
  a recruiting body's own official domain such as `ibps.in`.
- Prefer a direct cycle notice, corrigendum, result or dated calendar PDF as
  `sourceUrl`. Keep a generic notice board as a secondary link or watch URL.
- `sourceUrl` and every `officialLinks[].url` must use HTTPS, must be on the
  authority's `allowedHosts`, and the primary URL must also appear in
  `officialLinks`.
- Every watch URL must use an allowlisted HTTPS host.
- A state authority must declare all of its `regionCodes`. A state record's
  `state`, `stateCode` and `regionCodes` must agree with that authority and the
  canonical names in `lib/discovery.ts`.
- `sourcePublished` identifies when the supporting artifact was published or
  changed. `lastVerified` records the editorial check in
  `D Mon YYYY, HH:MM IST` format.
- Green, amber, red, blue and violet statuses receive a validation warning
  after 14 days without review and block a new build after 45 days. A scheduled
  exact date or month also cannot remain marked scheduled after it passes.

Do not cite coaching sites, aggregators, Wikipedia or search-result snippets.

## Dates and timelines

- A dated event uses a real ISO `YYYY-MM-DD` date. Impossible rollover dates
  such as `2026-02-31` fail validation.
- When an official calendar gives only a month or a month window, set
  `sortMonth` to its official `YYYY-MM` month, retain the source wording in
  `displayDate`, and use an appropriate tentative state. Do not invent the
  first day of a month.
- Never attach a date to an event whose `displayDate` says `Awaited` or
  `To be announced`.
- An undated event may be `current` or `tentative`; it cannot be completed,
  scheduled or postponed.
- Keep dated events chronological. A verified record needs at least one dated
  official event in the maintained catalogue window. A listed record may have
  no timeline at all.

Status tones have these meanings:

- `red`: postponed or cancelled
- `amber`: notification or date awaited
- `blue`: a future exam or stage is scheduled
- `violet`: examination in progress or result awaited
- `green`: applications open now
- `slate`: the recruitment cycle is complete

Green is an actionable claim: it is valid only on a `verified` record with an
exact, still-current application deadline in the timeline. If that deadline is
not captured from a dated official notice, use amber rather than implying that
applications are open.

## Vacancies and unknown fields

A listed record cannot set `vacancies` or `vacancyBreakdown`, and its vacancy
label cannot imply a number. Use the defaults from `listedExam`, or these exact
ideas when writing manually:

```ts
vacancyLabel: NOT_ANNOUNCED,
vacancyNote: "Vacancies will be added only after an official notice publishes them.",
age: "As prescribed in the notification.",
fee: "See the official notification",
```

For verified breakdowns, category columns must add to each row total and row
totals must add to the record's `vacancies` value.

## No duplicates

- Slugs are globally unique lowercase kebab-case.
- A notification number is unique within an authority and year.
- Titles, short titles and aliases are checked together within an authority and
  year so merely renaming a duplicate does not bypass validation.
- Keep one record per recruitment cycle. Prelims, mains, interviews and results
  belong in one timeline rather than separate records.
- Central recruitment belongs in its central module. Do not copy it into every
  state module merely because candidates can sit the exam there.
- Separate officially named cycles such as CDS I and CDS II are distinct.

## Checking work

Validate one module while authoring:

```bash
npx tsx tools/data/check-module.ts state-north
```

Then run the shared rules, regression tests and type-check:

```bash
npx tsx tools/data/validate.ts
node --import tsx --test tests/data-rules.test.ts
npx tsc --noEmit --incremental false
```

Coverage is a warning during the staged nationwide build. CI can turn it into a
hard requirement without changing code:

```bash
npx tsx tools/data/validate.ts --min-region-coverage=20
npx tsx tools/data/validate.ts --require-full-coverage
```

Equivalent environment variables are `MIN_REGION_COVERAGE` and
`REQUIRE_FULL_REGION_COVERAGE=1`.
