# Protected single-owner hosting

This is a password-protected shared workspace, not merchant accounts or production
multi-tenancy. All authorized requests use the same data and permissions. HTTPS
is required. Do not enter secrets in GitHub, chat, NEXT_PUBLIC_ variables or files
committed to this repository. Use the provider dashboards' secret settings.

## 1. Choose your access password

Generate and store a unique random password of at least 32 characters in a password
manager. Set the SAME `ADS_ACCESS_PASSWORD` secret on Vercel and Render. The browser
login username is `owner`. Basic authentication is verified independently on both
services; the existing Vercel rewrite forwards Authorization to FastAPI. Browser
credentials can remain cached until the browser is closed; use a private window
on shared computers. Rotate the password on both services to revoke access.
There is no account recovery, role separation or application rate limiter.

## 2. Render backend

Create a Python Web Service from `adnanf787/black-stone`, branch `main`, root blank.
Use Python 3.12 (set `PYTHON_VERSION=3.12.14`).

- Build: `pip install .`
- Start: `uvicorn ads_optimizer.api:app --host 0.0.0.0 --port $PORT --workers 1`
- Health check: `/api/v1/health` (only this endpoint is public)
- `ADS_HOSTED=1`
- `ADS_ALLOWED_ORIGINS=https://black-stone-8p52.vercel.app`
- `ADS_ACCESS_PASSWORD`: the password from step 1
- Attach a persistent disk at `/var/data` and set `ADS_DATA_DIR=/var/data/ads-optimizer`.

Persistent disks require a paid Render service. Keep one instance/worker: jobs and
state currently assume one process and local disk. Back up the disk and verify
restore separately. Missing/short passwords deny hosted access. Keep the optional
NVIDIA key unset initially; if used, configure it privately on the backend only.
Spark needs additional Java/Spark setup; these commands do not enable it. Large
benchmarks/training need adequate memory and are not certified on a small server.

## 3. Vercel frontend

Keep root directory `frontend`, Next.js preset and existing build settings.
Set `ADS_ACCESS_PASSWORD` to the SAME secret and `API_ORIGIN` to the Render HTTPS
origin, with no trailing slash or `/api/v1` suffix. Redeploy after changing settings.
Vercel deployments deny access if the password is absent or shorter than 32.
The browser will prompt for username `owner` and your password.

## 4. Verify before using real data

1. Open the frontend in a private window: verify login is required.
2. Open the Render `/api/v1/workspace` URL: verify it also requires login.
3. Sign in, generate labelled synthetic data and test an upload and plan.
4. Restart the backend and verify saved synthetic data remains.
5. Verify incorrect credentials are rejected and secrets never appear in browser
   bundles or response headers. Do not enable caching for API routes.

Local `npm run dev` remains without authentication when neither hosted mode nor
an access password is set. The hosted guard is an opt-in deployment extension;
Phases 7–8 platform connections remain future. The existing local-workspace labels
in the UI describe the shared single-user architecture; hosting is not a verified
merchant or multi-user deployment.

Local production browser verification: build with `API_ORIGIN=http://127.0.0.1:8211`
then run `node scripts/browser-hosting.mjs` (optional `CHROMIUM_EXECUTABLE`). The
script creates disposable data and fictional credentials, never real secrets.
