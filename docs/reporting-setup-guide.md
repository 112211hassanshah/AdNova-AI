# Guided reporting setup

Implemented 2026-10-28 as a Phase 3 usability follow-up.

## User journey

CSV import and ML Studio now ask:

1. What does a result count in this report? Purchases/paid orders, leads/enquiries,
   sign-ups/registrations, another report-defined result, or “I’m not sure yet”.
2. How long after an ad interaction can a result be counted? Clear click/view
   timing choices, another exact report rule, or “I’m not sure yet”.

A help section explains where the source report may state these rules. The
analytics link remains available while answers are unknown. Training readiness
and prediction-quality gates remain separate. Saving answers never trains a
model automatically and never changes live spending.

## What detection means

The backend detects explicit mapped conversion/attribution columns, or a result
column explicitly named `Purchases`. It does not infer purchases from generic
`conversions`, a Sales objective or positive revenue, nor select an attribution
window based on provider/profile or spend/revenue values. Detection is evidence
from a file, not verification against a connected provider.

Detected rules show their evidence and are protected from a conflicting answer.
Changing the mapping clears stale suggestions; validation returns fresh hints
for the current mapping. A partially specified rule is flagged for confirmation;
a report containing different known rules must be split into compatible exports.
The app retains “unspecified” instead of guessing when evidence is absent.
Unknown placeholders, including `n/a`, do not enable forecasting.

## Saved reports

ML Studio presents the questions when a saved report lacks definitions. The user
can resolve them without deleting/re-uploading the CSV. `Save my answers` posts
explicit confirmed answers, with 1–100 character definitions, against the selected
source report. Existing known definitions cannot be overwritten through this flow.

The backend creates and selects a **new immutable report revision**:

- Original canonical rows, metadata and model snapshots remain intact.
- Spend, revenue and other measurements remain identical in the revision.
- Missing rule fields are filled with the user's confirmed answers.
- `parent_dataset_id` links the revision to its source, and
  `reporting_evidence` distinguishes CSV evidence from user confirmation.
- Currency, source/synthetic flags and revenue provenance are preserved.
- Normal duplicate/overlap protections remain in place. Do not sum versions.
- Publication checks source existence/selection inside the catalog transaction;
  a concurrently changed/deleted source cannot be recreated silently.

Revisions are selectable datasets with their own deletion lifecycle. Deleting an
original dataset does not delete a separately saved revision. Each dataset's
model/holdout deletion policy remains unchanged. No user dataset's definitions or
source flags were automatically changed during this work.

## Verification

96 backend tests passed, including 15 guided-setup cases covering detection versus
unknowns, partial rules, evidence, source-bound immutable revisions, unchanged
financial values/model history, confirmation, mixed/conflicting rule rejection,
unknown placeholders and the actual HTTP endpoint. Existing ML/Spark/data tests
also passed. Required TypeScript/ESLint, build, Ruff and formatting checks passed.

17 browser checks covered detected CSV rules, remapping, plain-language questions,
unknown defaults, analytics access, saved version/readiness/reload, preserved
financial values and no automatic model training. Seven widths from 375–1440px
had no page overflow, and desktop/mobile question panels were visually reviewed.
Tests used disposable synthetic fixtures and restored the existing selection.
No captured page-level JavaScript errors. Full assistive-technology certification
and WebKit/Firefox coverage were not performed.

Evidence: [browser checks](reporting-setup-browser-results.json),
[desktop questions](screenshots/reporting-questions-1440.png),
[mobile questions](screenshots/reporting-questions-375.png).
