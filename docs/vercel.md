# Vercel-only deployment

The Next.js frontend and Python FastAPI function deploy in the same existing
Vercel project. Project root stays `frontend`; `frontend/api/index.py` imports the
backend package copied into `frontend/.backend/src` by the build script and included
by `frontend/vercel.json`. The generated copy is ignored by Git. Enable **Include source files
outside of the Root Directory** in Vercel's build settings. Keep Next.js as the
framework. `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` enables Vercel's supported large-function
packaging for Python data libraries; keep Fluid Compute enabled. The production `/api/v1/*` rewrite targets the Python function;
localhost rewrites are used only for local development. `API_ORIGIN` is not
required for this deployment. No Render service is required.

## Private configuration

Keep `ADS_ACCESS_PASSWORD` as a Production Secret, minimum 32 characters, with
login username `owner`. Both Python and Next verify the same environment value.
No secret is compiled into client bundles. Do not commit values or copy them to
chat. The minimal health endpoint returns no workspace data. Python denies all
other access without valid credentials, independently of the frontend guard.

Connect a free Neon Postgres database through Vercel Storage. The adapter reads
`ADS_DATABASE_URL`, `POSTGRES_URL`, or `DATABASE_URL` in that order. The integration
can inject credentials without copying them manually. Use separate databases for
previews and production; do not connect untrusted preview code to production data.
Neon Auth and Realtime are unnecessary for this shared single-owner workspace.
Stay on the free plan; no paid service is authorized. Provider quotas and terms
still apply; verify free-tier usage in the dashboards.

## How persistence works

Vercel's local filesystem is temporary. Each authenticated request obtains a
Postgres transaction lock on the single workspace row, restores a private
workspace snapshot into a fresh temporary directory and runs the existing Python
services. Successful requests atomically save a new archive before sending a
response; errors roll back the transaction. Streamed exports are buffered before
temporary files are removed. Concurrent requests wait at most 10 seconds for the
workspace lock, then get a retryable storage error. A lost network acknowledgement
can make commit status uncertain: refresh before retrying. Import fingerprints
continue to prevent exact duplicate datasets.

The archive includes the SQLite catalogs, campaign/commerce Parquet data, model
artifacts, reports and staged imports. It is private database data, not a public
Blob URL. The database owner is responsible for exports, retention and backups.
Deleting datasets through the app removes them from the next committed workspace;
provider-level backups/history have their own retention. This adapter intentionally
serializes one user's work; it is not a multi-tenant architecture.

## Hosted boundaries

- Total saved workspace: 64 MiB uncompressed and compressed; no symlinks.
- Requests/uploads: 4 MiB application ceiling, below Vercel's function request limit.
- Training: up to 10,000 rows, executed within the active request; keep the page
  open. The worker checks a 180-second budget; the Python function is configured
  for 300 seconds. A platform timeout cannot publish partial workspace state.
- Training acceptance, provenance and allocation policies are unchanged. Failures
  are shown honestly. Synthetic data remains labelled.
- Large dataset generation and detached Big Data experiments are disabled in the
  hosted UI and rejected by Python. Run the complete Spark/MapReduce lab locally.
- Python deployment uses `xgboost-cpu`, without unnecessary CUDA packages. No
  Spark/JVM is bundled. The local Python dependency setup is unchanged apart from
  optional Psycopg for hosting tests.
- The hosted workspace notice discloses these limits. Serverless training does
  not expose concurrent progress/cancellation while holding the workspace lock.
- Advisory plans only; no live platform connections or spending actions. Phases
  7–8 remain roadmaps, and real merchant accuracy remains unvalidated.

## Verify the actual deployment

Redeploy after connecting storage or changing private settings. Check the Python
function build includes the backend package and dependencies. Sign in using the
browser prompt, generate labelled synthetic campaigns, refresh to verify saved
state, train a small model, inspect its actual evaluation, make an advisory plan,
and export it. Confirm wrong credentials are rejected on API routes. Test at
desktop and mobile sizes. Do not claim these cloud checks passed until recorded
in `docs/progress.md`.

Local tests use a transaction double for deterministic storage failures and cold
invocations. These tests do not establish live Postgres availability or provider
quotas. `npm run verify` runs the full checks with the project's native ML setup.
