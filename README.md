# Petty Court

Small disputes. Unnecessarily dramatic justice.

An absurdly serious AI courtroom for extremely unserious everyday arguments.

## Run

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run build && npm start -- -p 3123   # demo: production build (port 3000 may be taken)
# npm run dev -- -p 3123                # development
```

| Variable | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | For live AI | Server-only. A Claude subscription is not an API key. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5-5`. Must support structured outputs. |

Without a key the app runs in **sample demo mode**: the form says so up front,
and every result is labelled "Sample demo — saved results". When AI is
configured, failures show an error (with Retry when it makes sense) and never
fall back to sample results.

## How it works

- `POST /api/trial` validates input (zod), then makes **one** Anthropic request
  that returns the whole trial as structured JSON (`kind: "trial"` or
  `kind: "out_of_scope"`), validated again before it reaches the browser.
- `POST /api/appeal` hears one OBJECTION per case: original complaint, defense context,
  the current trial result, and the objection (≤500 chars) go to the model in one
  request; it returns `UPHELD`, `MODIFIED`, or `OVERTURNED` (or `out_of_scope`).
  Request bodies are size-limited before parsing (8 KB trial, 24 KB appeal).
- The sample demo has one saved appeal, used only for the air fryer sample with its
  exact preset objection. Edited objections need the live AI court.
- `GET /api/status` tells the client whether the AI court is configured.
- The verdict document always shows the latest judgment. "Copy verdict" copies a
  plain-text version; "Print / Save PDF" uses `window.print()` with a print
  stylesheet that prints only the document (`.no-print` hides everything else).
- Server-only code lives in `src/server/` (guarded by `server-only`); shared
  schemas in `src/lib/schemas.ts`.
