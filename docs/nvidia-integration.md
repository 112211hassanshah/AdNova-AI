# Optional NVIDIA explanations

User-requested extension after Phase 5. Phase 6 commerce software is now implemented;
real merchant validation remains pending. Commerce is separate from AI explanations.
The university MVP still runs without credentials. This feature explains local
evidence; it does not train a new predictor, calculate financial metrics, infer
order attribution, change an allocation or contact an advertiser account.

## Use it

With `npm run dev` running, open [AI Assistant](http://127.0.0.1:3000/ai-assistant).

1. Save a NVIDIA API key in the password field. Use **Replace key** if it was
   exposed in a chat or elsewhere. Never commit a key or use a `NEXT_PUBLIC_`
   variable for it.
2. Choose **Test NVIDIA access**. This sends a fixed connection-check prompt,
   with no dataset information. A configured key is not reported as verified
   until a real response arrives. The time of the last check stays visible.
3. Select a campaign dataset. Choose campaign performance, the latest completed
   model evaluation, or the latest saved budget plan. Overview filters do not
   apply to these whole-source summaries.
4. Expand **Exact local figures** to inspect the numerical source reference.
   These figures remain on this computer. Review the separate qualitative
   summary, which is the exact report payload eligible to leave the computer.
5. Explicitly approve sending that summary, then choose **Explain this report**.
   The final text is labelled AI-generated and should be checked against the
   local reference. Approval resets after success. Refreshing/changing a report
   clears the old explanation and approval. The server rejects a stale preview.

Missing data/model/plan states explain what is needed. Rate-limit, authentication,
timeout and malformed-response failures show an error without fabricating an
answer. A rejected explanation can be retried explicitly; there are no automatic
provider retries, background calls or AI requests during normal analytics use.
Navigating away does not recall an already transmitted request. The answer is
not persisted by the application; reloading the page clears it.

## Provider and request boundary

Model: `nvidia/nemotron-3.5-lightning-30b-a3b`.
Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`.
Both are fixed in the Python adapter; the browser cannot select another host.
The [official model page](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b)
currently lists a free prototyping endpoint. This is not a free-production or
availability guarantee; check account access and current
[NVIDIA terms](https://docs.api.nvidia.com/nim/docs/product) before real deployment.

Python derives qualitative observations from the existing numeric services, such
as whether reported attributed revenue exceeds ad spend, whether model error is
lower/higher than the baseline, whether acceptance checks passed and whether a
saved plan has a supported forecast. Missing values and source/provenance flags
remain explicit. Synthetic observations are labelled as simulated evidence.

Only the displayed allowlisted qualitative JSON, plus fixed explanation
instructions, is transmitted. Numeric financial values, dates, dataset IDs,
filenames, campaign names, customer details, raw rows, demographics and model
artifacts are excluded from that payload. The separate numeric reference and
source-bound hash remain local. Hosted processing is an intentional exception
to the app's otherwise local calculations and storage; the payload does leave
the machine for NVIDIA. The app cannot control NVIDIA's retention policies.

The model is instructed to use plain paragraphs, not introduce quantities or
causal claims, distinguish revenue from profit, and disclose unavailable forecasts
and synthetic evidence. Answers containing digits are withheld. This is a guard
against generated numeric claims, not a guarantee that all prose is correct.
AI prose is not input to the optimizer, model acceptance or any metric calculation.

Requests use Python's standard HTTPS library, so no OpenAI SDK or additional
package is required. Reasoning is disabled; `reasoning_content` and tool calls are
never displayed or executed. Only bounded final text is accepted. The adapter
uses a thirty-second network-operation timeout, a bounded response read, a
completion-token limit and one in-flight provider request per backend process.
Redirects are blocked to protect the authorization header. Provider errors and
validation failures are sanitized; response bodies/headers and credentials are
not logged or returned to the client. No streaming of private reasoning occurs.

## Credential lifecycle

The UI stores the key at `data/ai/nvidia-api-key` (or under the configured
`ADS_DATA_DIR`). The containing directory is owner-only, and the key file has
mode `0600` with atomic replacement. Root `data/` is excluded by `.gitignore`.
The file is plaintext, not encrypted; this remains a local single-user tool.
Protect the machine and backups accordingly. The saved key is never returned
to the browser or placed in frontend code, localStorage or generated reports.

Alternatively export `NVIDIA_API_KEY` in the backend launch environment. This
takes precedence over the private local file and disables UI key replacement/
removal until the variable is unset. The backend still does not load `.env`
files automatically. Do not put secrets in `.env.example`.

**Remove saved key** deletes the local file, not the NVIDIA credential itself.
Revoke/rotate a credential through NVIDIA to invalidate it. A key pasted in chat
should be replaced even if its connection test succeeds. The provided credential
was configured only in the ignored private file; it is not reproduced in these
instructions or evidence. Connection verification is process-local and resets
after a backend restart/reload; the key remains configured but requires a new
explicit check. An API response is past evidence, not continuous health monitoring.

## Local API

| Endpoint | Behavior |
| --- | --- |
| `GET /api/v1/ai/status` | Returns provider/model, configured/verified state and last sanitized check result; no network request and no secret |
| `PUT /api/v1/ai/key` | Stores/replaces a private key; does not test or claim access |
| `DELETE /api/v1/ai/key` | Removes the locally saved credential |
| `POST /api/v1/ai/test` | Explicit connection-only request |
| `GET /api/v1/ai/summary?kind=performance\|model\|budget` | Prepares local qualitative preview, numeric reference and source hash |
| `POST /api/v1/ai/explain` | Requires `kind`, matching `summary_sha256` and `approved: true` before contacting NVIDIA |

The existing loopback write-origin guard covers new mutation routes. No hosted
authentication or multi-tenant security is claimed. Advertiser/Shopify connections
remain unavailable and separate from this AI provider's actual status.

## Verification

```sh
npm run verify
npm run test:e2e:nvidia
```

The normal backend suite uses temporary workspaces and mocked provider responses;
it never spends a live API request. It checks credential lifecycle/permissions,
sanitized validation, environment precedence, actual model/plan summary gates,
source hash/consent, numeric-claim rejection, reasoning suppression, concurrency,
timeouts, upstream errors, oversized/malformed responses and recovery.

The dedicated browser command requires a configured key and running services.
It makes real connection/explanation calls using a disposable **synthetic** source,
checks approval and missing-evidence states, tests a separately labelled simulated
rate-limit UI response, reviews seven widths and all eight routes at desktop/mobile,
and restores the original dataset selection/list. Use `CHROMIUM_EXECUTABLE` as
described in the university guide when the default browser cache is unavailable.

Evidence: `nvidia-browser-results.json`, `nvidia-live-example.json`,
`nvidia-checks.json`, and `screenshots/nvidia-assistant-{1440,375}.png`.
The live example contains a clearly labelled synthetic qualitative payload and
actual final answer, never a credential or raw uploaded source.
