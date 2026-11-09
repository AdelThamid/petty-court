import type { Appeal, CaseInput, Trial } from "./types";

/**
 * Saved trials. A sample is matched by its exact complaint text; anything else
 * gets a templated trial.
 */
type SavedCase = {
  input: CaseInput;
  trial: Trial;
  /** A saved appeal, used ONLY for this exact case and this exact objection. */
  savedAppeal?: { objection: string; appeal: Appeal };
};

export const FEATURED_SAMPLE: SavedCase = {
  input: {
    defendantNickname: "Kevin",
    complaint:
      "My roommate used my air fryer, left it dirty, and said the heat kills the germs.",
    defenseContext: "The heat literally kills the germs. It's basically self-cleaning.",
  },
  trial: {
    kind: "trial",
    caseTitle: "The Plaintiff v. Kevin, Self-Appointed Sanitation Expert",
    charge: "Aggravated appliance disrespect",
    prosecutor:
      "Your Honor, the defendant has confused an air fryer with a self-cleaning oven. Exhibit A is a basket containing what can only be described as nugget sediment. “The heat kills the germs” is not a cleaning policy. It is a cry for help.",
    defense:
      "My client was operating under severe chicken-nugget pressure. It was 11:47 PM. The nuggets were frozen. The hunger was not. And my client did not leave the basket dirty, Your Honor. He left it seasoned.",
    judgeReasoning:
      "The court finds the nugget-pressure defense emotionally compelling but legally crispy. Heat may kill germs. It does not kill accountability.",
    verdict: "GUILTY",
    sentence: "Seven consecutive dishwashing shifts, without eligibility for paper plates.",
    closingLine: "Court is adjourned. Someone soak that basket.",
  },
  savedAppeal: {
    objection: "It was actually his air fryer, and I have never cleaned it either.",
    appeal: {
      kind: "appeal",
      reaction:
        "The plaintiff has filed a complaint about a dirty air fryer they do not own and have never cleaned. The court needs a moment. The court is taking that moment.",
      ruling: "OVERTURNED",
      verdict: "EVERYONE IS RIDICULOUS",
      judgeReasoning:
        "Taking the plaintiff at their word, this basket has had two owners in spirit and zero in practice. Neglect, like nugget sediment, has been shared.",
      sentence:
        "Joint custody of the basket. Alternating weekly scrub shifts, with a laminated rota taped to the appliance and initialled after every rinse.",
      closingLine: "The germs were never the problem. You both were.",
    },
  },
};

export const SAMPLE_CHIPS: SavedCase[] = [
  {
    input: {
      defendantNickname: "Dana",
      complaint: "My roommate ate my labeled leftovers.",
      defenseContext: "",
    },
    trial: {
      kind: "trial",
      caseTitle: "The Plaintiff v. Dana, Midnight Fridge Raider",
      charge: "Felony disregard of a clearly labeled container",
      prosecutor:
        "Your Honor, the container said “DO NOT EAT” in Sharpie. Permanent marker. The plaintiff chose permanence. The defendant chose violence. This was Tuesday’s lunch, eaten standing up in the glow of the refrigerator light.",
      defense:
        "My client cannot read in the dark, and the fridge light is famously dim. Also, possession is nine-tenths of the law. My client possessed those leftovers. Very briefly. With great enthusiasm.",
      judgeReasoning:
        "The court notes that the fridge light is, in fact, quite bright. The court has checked. Twice.",
      verdict: "GUILTY",
      sentence:
        "Must replace the meal within 48 hours and personally label it with the plaintiff’s name in fancy calligraphy.",
      closingLine: "Labels are not suggestions. They are tiny contracts.",
    },
  },
  {
    input: {
      defendantNickname: "Marcus",
      complaint: "My friend says “I’m outside” before leaving home.",
      defenseContext: "",
    },
    trial: {
      kind: "trial",
      caseTitle: "The Plaintiff v. Marcus, Alleged Outsider",
      charge: "First-degree location misrepresentation",
      prosecutor:
        "Your Honor, the defendant texted “I’m outside.” At that exact moment, the defendant was inside his own home, wearing one sock. The plaintiff stood on the curb for twenty-two minutes, refreshing a location dot that did not move.",
      defense:
        "My client was outside, Your Honor. Spiritually. “Outside” is a state of mind. My client had mentally left the house. His body simply had not received the memo.",
      judgeReasoning:
        "The court accepts that the defendant was outside in spirit, and will therefore sentence him in body. The single sock is noted as an aggravating factor.",
      verdict: "GUILTY",
      sentence:
        "For 30 days, must arrive ten minutes early and wait on the curb while the plaintiff texts “I’m outside” from bed.",
      closingLine: "Next time, be outside in spirit and in shoes.",
    },
  },
  {
    input: {
      defendantNickname: "Priya",
      complaint: "My teammate named the final file final_FINAL_v7.",
      defenseContext: "",
    },
    trial: {
      kind: "trial",
      caseTitle: "The Plaintiff v. Priya, Keeper of Many Finals",
      charge: "Reckless versioning in the first degree",
      prosecutor:
        "Your Honor, the shared drive contains final.docx, final_FINAL.docx, v2 through v6, and the file in question: final_FINAL_v7. Seven finals. Not even a tennis tournament has that many.",
      defense:
        "My client was simply being honest about the creative process. Nothing is ever final. Not files. Not feelings. And may I remind the court: v7 was the version that got submitted.",
      judgeReasoning:
        "The court agrees that nothing is ever final, and notes that this includes the court’s patience. The submission of v7 is mitigating, but only slightly.",
      verdict: "EVERYONE IS RIDICULOUS",
      sentence:
        "Both parties must adopt ISO 8601 dates in all filenames and write “I will use version control” 25 times.",
      closingLine: "Court is adjourned. Please save this ruling as ruling_FINAL.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Templated trials for custom complaints                             */
/* ------------------------------------------------------------------ */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(list: readonly T[], seed: number, salt = 0): T {
  return list[(seed + salt * 7919) % list.length];
}

function quote(s: string, max = 140): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

const CHARGES = [
  "Aggravated pettiness",
  "Felony inconsideration in the second degree",
  "Reckless endangerment of group chat harmony",
  "Conspiracy to commit mild annoyance",
  "Unlawful disruption of the vibe",
  "Gross negligence of shared spaces",
];

const PROSECUTION_CLOSERS = [
  "The prosecution has seen many things, Your Honor. Never this.",
  "The plaintiff has suffered greatly. Mostly in the form of a long sigh, but greatly.",
  "Your Honor, there is no jury. Just you. Please be appalled.",
];

const DEFENSE_OPENERS = [
  "Your Honor, my client is a person of deep character and shallow attention span.",
  "My client would like the court to know they were having a very long week. It was a Tuesday.",
  "The defense asks: who among us has not, at some point, been exactly this inconsiderate?",
];

const REMARKS = [
  "The court has reviewed the evidence, consulted its conscience, and sighed audibly.",
  "The court has heard enough. The court has, frankly, heard more than enough.",
  "The court finds the defense creative, the prosecution dramatic, and the whole thing exhausting.",
];

const SENTENCES = [
  "Must say “you were right” out loud, with eye contact, at a time of the plaintiff’s choosing.",
  "Three consecutive weekends of taking out the trash, without theatrical sighing.",
  "Must buy the plaintiff one (1) beverage of their choosing, oat milk upcharge included.",
  "Banned from the phrase “it’s not a big deal” for fourteen days.",
];

const CLOSERS = [
  "Court is adjourned. Everyone go drink some water.",
  "Justice has been served. Lightly toasted.",
  "This court will not be taking questions. Or snacks.",
];

export function templatedTrial(input: CaseInput): Trial {
  const seed = hash(input.complaint + input.defendantNickname);
  const name = input.defendantNickname.trim() || "The Defendant";
  const who = input.defendantNickname.trim() ? name : "the defendant";
  const charge = pick(CHARGES, seed);

  const defenseMiddle = input.defenseContext.trim()
    ? `As my client explained: “${quote(input.defenseContext)}” Frankly, Your Honor, that is legally waterproof.`
    : `Note that nobody even asked for ${who}’s side of the story. That is how you know it was a good one.`;

  return {
    kind: "trial",
    caseTitle: `The Plaintiff v. ${name}`,
    charge,
    prosecutor: `Your Honor, the facts are as clear as they are petty: “${quote(input.complaint)}” ${pick(PROSECUTION_CLOSERS, seed, 3)}`,
    defense: `${pick(DEFENSE_OPENERS, seed, 1)} ${defenseMiddle}`,
    judgeReasoning: pick(REMARKS, seed, 4),
    verdict: "GUILTY",
    sentence: pick(SENTENCES, seed, 5),
    closingLine: pick(CLOSERS, seed, 6),
  };
}

export function sampleTrialFor(input: CaseInput): Trial {
  const saved = [FEATURED_SAMPLE, ...SAMPLE_CHIPS].find(
    (s) => s.input.complaint.trim() === input.complaint.trim(),
  );
  if (!saved) return templatedTrial(input);
  const nick = input.defendantNickname.trim();
  if (!nick || nick === saved.input.defendantNickname) return saved.trial;
  return {
    ...saved.trial,
    caseTitle: saved.trial.caseTitle.replace(saved.input.defendantNickname, nick),
  };
}
/* ------------------------------------------------------------------ */
/* Appeals: one saved, the rest templated                             */
/* ------------------------------------------------------------------ */

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

/** The preset objection for a sample case that has a saved appeal, if any. */
export function presetObjectionFor(input: CaseInput): string | null {
  return normalize(input.complaint) === normalize(FEATURED_SAMPLE.input.complaint)
    ? FEATURED_SAMPLE.savedAppeal!.objection
    : null;
}

/**
 * Returns the saved appeal only when both the case and the objection match the
 * preset exactly. Never applied to arbitrary user text.
 */
export function savedAppealFor(input: CaseInput, objection: string): Appeal | null {
  const preset = presetObjectionFor(input);
  if (!preset || normalize(objection) !== normalize(preset)) return null;
  return FEATURED_SAMPLE.savedAppeal!.appeal;
}

const REACTIONS = [
  "The court has read your objection. The court has read it again. The court is now rubbing its temples.",
  "Ah. New information. The court loves new information almost as much as it hates surprises.",
  "The court notes the objection, and also notes that you waited until after the verdict to mention it.",
  "The bailiff gasped. The court did not gasp, but the court understands why the bailiff did.",
];

/** A templated ruling on any objection, taken on faith and deterministic per text. */
export function templatedAppeal(trial: Trial, objection: string): Appeal {
  const seed = hash(objection + trial.caseTitle);
  const reaction = pick(REACTIONS, seed);
  let ruling = pick(["UPHELD", "MODIFIED", "OVERTURNED"] as const, seed, 2);
  if (ruling === "OVERTURNED" && trial.verdict === "EVERYONE IS RIDICULOUS") ruling = "MODIFIED";

  if (ruling === "UPHELD") {
    return {
      kind: "appeal",
      reaction,
      ruling,
      verdict: trial.verdict,
      judgeReasoning:
        "Taking the objection on faith, the court finds it changes the vibe but not the facts. The original ruling stands, slightly more tired.",
      sentence: trial.sentence,
      closingLine: "Objection noted. Objection ignored. Court is adjourned.",
    };
  }
  if (ruling === "MODIFIED") {
    return {
      kind: "appeal",
      reaction,
      ruling,
      verdict: trial.verdict,
      judgeReasoning:
        "The new context shifts some of the blame. Not all of it. The court is adjusting the sentence, not its opinion of anyone.",
      sentence: "Sentence reduced to one (1) sincere apology, delivered without the word “but.”",
      closingLine: "Justice has been recalibrated. Slightly.",
    };
  }
  return {
    kind: "appeal",
    reaction,
    ruling,
    verdict: "EVERYONE IS RIDICULOUS",
    judgeReasoning:
      "On reflection, and on your word alone, the blame was never as tidy as the complaint suggested. Nobody leaves this courtroom clean.",
    sentence: "Both parties must say “we’re both a bit much” out loud, at the same time, with eye contact.",
    closingLine: "Verdict overturned. Dignity not restored.",
  };
}

/** The saved appeal for its exact preset objection, otherwise a templated ruling. */
export function appealFor(input: CaseInput, trial: Trial, objection: string): Appeal {
  return savedAppealFor(input, objection) ?? templatedAppeal(trial, objection);
}
