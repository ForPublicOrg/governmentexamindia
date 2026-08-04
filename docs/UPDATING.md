# Updating exam records

Government Exam India stays static. Source monitoring and editorial review happen before a new build.

## Flow

1. `data/source-registry.json` lists each recruiting body, its allowed official domains and pages worth monitoring.
2. `npm run data:watch` compares those pages with the saved source fingerprints. A change is a review signal only; it never edits an exam or publishes extracted text.
3. A reviewer opens the changed official notice and edits the matching family module under `data/exams/`.
4. Update only the fields that changed. Also update `sourcePublished`, `lastVerified`, the appropriate official link and `changeLog` when a previously displayed fact changed.
5. Run `npm run data:validate:full` and `npm test`. The build stops on duplicate records, missing source authorities, invalid dates, non-HTTPS primary sources, state metadata gaps, incomplete 36-region coverage or incorrect category totals.
6. Merge and deploy the resulting static build. Homepage updates, search, state pages, type pages, calendar and change feed all read from the same record.

## Operating schedule

- Registered official notice, result and calendar pages: monitor once daily at 06:47 IST. Urgent postponements and deadline changes still use a reviewed manual release.
- Conditional ETag and Last-Modified requests avoid downloading an unchanged page when the official server supports them.
- Routine unchanged runs stay in the workflow summary; a downloadable report is retained only when a source is new, changed, blocked or unreachable.
- Rebuild after a reviewed data change; calendar windows are derived at build time and the public deployment itself needs no scheduled compute.
- Use an urgent reviewed release for postponements, cancellations and deadline changes.

Temporary 403, 405 or 429 responses from an official website are warnings, not proof that a notice disappeared. Only a reviewed official artifact changes the public status.
