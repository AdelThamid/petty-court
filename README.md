# Petty Court

**Small disputes. Unnecessarily dramatic justice.**

**▶ Try it: https://adelthamid.github.io/petty-court/**

Petty Court is a comedy web app that puts your pettiest everyday arguments on
trial. You describe a small grievance, like a roommate eating your labelled
leftovers, a friend who never returns your charger, or a coworker who names
files `final_FINAL_v3.docx`, and a courtroom treats it with completely
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

### Where the rulings come from

There's no AI and no server. The site runs entirely in your browser:

- The **"Notable precedent"** cases and the **Try a sample** case have
  hand-written trials.
- Anything else you type gets a **templated trial**: your complaint and their
  side of the story are quoted in the courtroom, with the charge, sentence and
  closing line drawn from a set of stock lines. The same complaint always gets
  the same trial.
- **Objections** work the same way. The air fryer sample has a hand-written
  appeal for its preset objection; any other objection gets a templated ruling.

---

## Running it yourself

You'll need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/AdelThamid/petty-court.git
cd petty-court
npm install
npm run dev -- -p 3123       # open http://localhost:3123
```

`npm run build` produces a static site in `out/`, which any static host can
serve.

### Deployment

Every push to `main` builds the site and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`. The workflow sets `NEXT_PUBLIC_BASE_PATH` to
`/petty-court` because Pages serves the site from that subfolder.

---

## Built with

- [Next.js](https://nextjs.org/) 16 (static export) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4 and [shadcn/ui](https://ui.shadcn.com/) components
- [Zod](https://zod.dev/) for the data shapes and form validation
- Hosted on [GitHub Pages](https://pages.github.com/)

### Project layout

```
src/
  app/            The page, layout and global styles
  components/
    court/        Courtroom UI: case form, testimony, verdict, objection dialog
    ui/           Shared buttons, inputs, dialogs
  lib/            Types, Zod schemas, saved and templated cases, helpers
```
