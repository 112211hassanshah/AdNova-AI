# NVIDIA integration completion report

October 30, 2026. User explicitly requested NVIDIA Nemotron integration after
Phase 5 and supplied a credential. Delivered an optional AI Assistant with real
hosted API access and source-bound report explanations. Phase 6 remains unstarted.
Project 1 was not accessed; no delegation, new package, paid subscription, live
advertiser action or model/optimizer policy change was introduced.

## Delivered behavior

- New `/ai-assistant` route, desktop/sidebar and mobile navigation, descriptive
  title, saved-source selector and consistent rounded light/charcoal design.
- Private backend key save/replace/remove and explicit connection test. The
  supplied key exists only in ignored local `data/ai/nvidia-api-key`, with owner-
  only directory/file permissions. The API never returns it. `NVIDIA_API_KEY` in
  the launch environment is also supported and takes precedence.
- Three explanation choices: full-source campaign performance, latest completed
  model evaluation, latest saved budget plan. Missing evidence gives a remedy.
  Local numeric references remain inspectable; the hosted payload contains only
  backend-derived qualitative observations and source-quality disclosures.
- Explicit preview approval and source-bound hash before transmission. Changing
  reports clears stale answers/approval; the server rejects a changed snapshot.
- Fixed NVIDIA host/model, blocked redirects, bounded completion/read, network
  timeout, single in-flight provider request, sanitized errors, final text only,
  no tools or private reasoning output and no automatic retries/background calls.
- Numeric claims in AI output are withheld. AI text is escaped by React and never
  becomes a financial metric, prediction, training result or allocation input.
  Existing XGBoost evaluation and constrained optimization remain authoritative.

This is hosted processing when explicitly invoked. The app is otherwise local,
single-user and unauthenticated. It is not encrypted secret management or a
production AI service. A pasted credential should be revoked/replaced through
NVIDIA; local deletion alone does not revoke it. Credential rotation is available
in the UI without editing source code. No credentials appear in this report.

## Verification and evidence

- **164 backend tests passed** with no skips, including the 149 existing tests
  and 15 new provider/summary/secret/error-contract cases. Existing native XGBoost,
  Spark/MapReduce and exact-budget checks remained green. The automated backend
  tests use temporary stores and fake provider responses, never the live key.
- The 15 affected AI tests passed again after refining the final source flags.
  TypeScript/ESLint, production build, Ruff and formatting passed, with affected
  frontend checks/build repeated for the final accessible selector.
- **17 browser checks passed** with actual NVIDIA connection and explanation
  calls against disposable synthetic data. This is genuine API evidence, not a
  mocked success. A separately labelled rate-limit response is simulated solely
  for UI failure/recovery checks.
- Reviewed the actual explanation page at 1440, 1280, 1024, 768, 430, 390 and 375px;
  no final horizontal page overflow. All eight routes checked at desktop/mobile
  with the new navigation item. Actual desktop/mobile screenshots reviewed.
- Checked empty password display/no key in public status, explicit approval,
  missing model/plan remedies, cleared stale answers, empty selection, mobile
  navigation and failure notices. No page-level JavaScript errors were captured.
- Original source selection and dataset list restored after browser QA; temporary
  synthetic datasets removed. No source, model, plan or financial record was
  overwritten by the explanation workflow.
- Runtime key is ignored by Git. An exact-secret scan found no copy in nonignored
  source, documentation or evidence; frontend packages/bundles do not embed it.
- Fixed the workspace API's stale phase field to report the completed Phase 5.

Evidence: `nvidia-checks.json`, `nvidia-browser-results.json`,
`nvidia-live-example.json`, and `screenshots/nvidia-assistant-{1440,375}.png`.
The live example is explicitly synthetic and contains only the qualitative
payload plus an actual final answer, not the raw provider response or secret.

## Issues found and resolved

The first live answer repeated numerical values despite the requested narrative
format. The numeric-output gate blocked it rather than presenting it as evidence.
Refined the provider boundary to transmit locally derived qualitative facts while
keeping exact numeric references local; the final real explanation passed the
unchanged output guard. No model threshold or optimization rule was relaxed.

The summary's preformatted content initially expanded an implicit grid track on
mobile. Explicit bounded grid tracks and min-width controls now contain it, with
internal scroll for JSON. Added an explicit accessible name to the report selector
after the exact-label browser assertion identified an ambiguous implicit name.
The source-change test initially reused an already saved fixture; a distinct seed
now exercises the intended stale-hash rejection. No required check remains failed.

## Limits

LLM prose can still be wrong, including claims written without digits. Qualitative
only input and numeric-output rejection reduce risk, but do not certify factual
accuracy; users must compare it with the local reference. Supported versus missing
forecasts and synthetic evidence remain explicit. No AI is permitted to establish
causal uplift, certify merchant accuracy, guess attribution/costs or change spend.

Free NVIDIA access is a prototyping facility with provider limits and possible
outages/model changes. Actual request handling and retention are NVIDIA's concern;
the app does not claim the hosted service keeps data locally. Verification status
reflects a recorded response and resets on backend restart; it is not a continuous
health monitor. Local storage is owner-restricted plaintext. Full screen-reader,
multi-browser, production security and merchant validation remain outside this
change. See `nvidia-integration.md` for exact setup, data scope and lifecycle.
