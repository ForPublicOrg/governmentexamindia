# Updating exam records

Government Exam India stays static. Source monitoring and editorial review happen before a new build.

## Flow

1. `data/source-registry.json` lists each recruiting body, its allowed official domains and pages worth monitoring.
2. `npm run data:watch` compares those pages with the saved source fingerprints. A change is a review signal only; it never edits an exam or publishes extracted text.
3. A reviewer opens the changed official notice and edits the matching record in `lib/exams.ts`.
4. Update only the fields that changed. Also update `sourcePublished`, `lastVerified`, the appropriate official link and `changeLog` when a previously displayed fact changed.
5. Run `npm run data:validate` and `npm test`. The build stops on duplicate records, missing source authorities, invalid dates, non-HTTPS primary sources, state metadata gaps or incorrect category totals.
6. Merge and deploy the resulting static build. Homepage updates, search, state pages, type pages, calendar and change feed all read from the same record.

## Operating schedule

- Active application, postponement and result pages: monitor every 3 hours.
- Calendars and slower-moving notice indexes: monitor every 6 hours.
- Rebuild shortly after midnight IST so date-window displays stay current.
- Use an urgent reviewed release for postponements, cancellations and deadline changes.

Temporary 403, 405 or 429 responses from an official website are warnings, not proof that a notice disappeared. Only a reviewed official artifact changes the public status.
