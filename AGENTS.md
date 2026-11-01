# Project 2 working instructions

Read `agent.md` for functionality and engineering requirements, and `design.md`
(the supplied design-2.md v2 contract) for presentation before changing this app.
Follow the human user's instructions first. Original, unrelated software-house
documents are preserved under `references/source-documents/`; they do not define
this advertising optimizer's content, palette, or build order.

Build one phase at a time, with backend, responsive UI, tests and review together.
Record progress in `docs/progress.md`. Report bugs/problems promptly so the user
can decide whether to switch to GPT-6 Astra. Before Phase 2 Spark + MapReduce
implementation, remind the user to select very high reasoning. Do not change
model settings on their behalf. Keep Project 1 untouched. Do not delegate unless
the user requests it.

Use Next.js/TypeScript/Tailwind and Python/FastAPI. Backend owns data, analytics,
training and optimization. Never fabricate metrics, benchmarks, model training,
recommendations or connection states. No live spending actions. Phases 7–8 are
future roadmaps. Current scope is local single-user use, without authentication.

Run `npm run check`, `npm run build`, `.venv/bin/python -m pytest`, and
`.venv/bin/ruff check backend scripts` for the phase as applicable. Browser-review
desktop and mobile. Keep instructions, dependencies and phase reports current.

User-authorized protected hosting extension (November 1, 2026): Vercel frontend
and separately hosted FastAPI may use shared single-owner Basic authentication
over HTTPS. See `docs/hosting.md`. Local use stays unauthenticated by default;
this does not implement multi-user accounts or Phase 7 platform connections.
