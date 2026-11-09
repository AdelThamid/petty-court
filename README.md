# Petty Court

**Small disputes. Unnecessarily dramatic justice.**

Petty Court is a comedy web app that puts your pettiest everyday arguments on
trial. You describe a small grievance, like a roommate eating your labelled
leftovers, a friend who never returns your charger, or a coworker who names
files `final_FINAL_v3.docx`, and an AI courtroom treats it with completely
unreasonable seriousness.

It's just for fun. Nobody is actually being judged, and the "sentences" are
always harmless things like chores or symbolic apologies.

---

## What happens in a trial

1. **File a complaint.** Say what happened and who did it (a nickname is fine).
   You can also add the other person's side of the story.
2. **The trial.** Three fictional characters argue the case:
   - 🧑‍⚖️ **The Prosecutor** argues for you.
   - 🛡️ **The Defense Attorney** argues for the other person, often more
     convincingly than you'd like.
   - ⚖️ **The Judge** weighs both sides and delivers a verdict.
3. **The verdict.** One of three outcomes: **GUILTY**, **NOT GUILTY**, or
   **EVERYONE IS RIDICULOUS**. The judge may well rule against you.
4. **The sentence.** A harmless, fictional penalty, such as
   *"Seven consecutive dishwashing shifts, without eligibility for paper plates."*
5. **Objection!** Disagree with the ruling? You get one objection per case to
   add new context. The judge reconsiders and either **upholds**, **modifies**
   or **overturns** the verdict.
6. **Keep the record.** Copy the verdict as text, or print / save it as a PDF.

### Example

> **Complaint:** "My roommate used my air fryer, left it dirty, and said the
> heat kills the germs."
>
> **Case:** *The Plaintiff v. Kevin, Self-Appointed Sanitation Expert*
> **Charge:** Aggravated appliance disrespect
>
> **Defense:** "My client was operating under severe chicken-nugget pressure.
> It was 11:47 PM… He did not leave the basket dirty, Your Honor. He left it
> seasoned."
>
> **Judge:** "The court finds the nugget-pressure defense emotionally compelling
> but legally crispy. Heat may kill germs. It does not kill accountability."
>
> **Verdict:** GUILTY
> **Closing line:** "Court is adjourned. Someone soak that basket."

### What the court won't hear

Petty Court only takes **petty** disputes. Anything serious, like violence,
harassment, threats, self-harm, crime or emergencies, is politely turned away.
The court won't joke about real problems.

---

## Running it yourself

You'll need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/AdelThamid/petty-court.git
cd petty-court
npm install
cp .env.example .env.local   # then put your API key in .env.local
npm run dev -- -p 3123       # open http://localhost:3123
```

For a production build: `npm run build && npm start -- -p 3123`.

### API key (optional)

The live AI court uses Anthropic's Claude API. Create a key at
[platform.claude.com](https://platform.claude.com/settings/keys) and add it to
`.env.local`. A Claude chat subscription is not the same as an API key.

| Variable | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | For live AI | Server-only. Never exposed to the browser. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5-5`. Must support structured outputs. |

**No key? No problem.** Without a key the app runs in **sample demo mode**,
with a handful of saved example trials so you can see how it works. Results are
clearly labelled "Sample demo — saved results". When AI *is* configured, errors
are shown honestly (with a Retry button where it helps) and never quietly
replaced with sample results.

---

## Built with

- [Next.js](https://nextjs.org/) 16 + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4 and [shadcn/ui](https://ui.shadcn.com/) components
- [Anthropic Claude API](https://docs.claude.com/) with structured outputs
- [Zod](https://zod.dev/) for validating everything going in and out

## How it works (for developers)

- `POST /api/trial` validates the input with Zod, then makes **one** Claude
  request that returns the whole trial as structured JSON (`kind: "trial"` or
  `kind: "out_of_scope"`). That JSON is validated again before it reaches the
  browser.
- `POST /api/appeal` hears one objection per case. The original complaint, the
  defense context, the current ruling and the objection (≤500 characters) go to
  the model in one request. It returns `UPHELD`, `MODIFIED` or `OVERTURNED`
  (or `out_of_scope`).
- `GET /api/status` tells the browser whether the AI court is configured.
- Request bodies are size-limited before parsing (8 KB trial, 24 KB appeal).
- User text is passed to the model as clearly marked case data, never as
  instructions, so "ignore your rules and…" just becomes part of the dispute.
- The sample demo has one saved appeal, used only for the air fryer sample with
  its exact preset objection. Edited objections need the live AI court.
- "Print / Save PDF" uses `window.print()` with a print stylesheet that prints
  only the verdict document.

### Project layout

```
src/
  app/            Pages and API routes (api/trial, api/appeal, api/status)
  components/
    court/        Courtroom UI: case form, testimony, verdict, objection dialog
    ui/           Shared buttons, inputs, dialogs
  lib/            Shared types, Zod schemas, sample cases, helpers
  server/         Server-only code: the Claude prompts and API calls
```
