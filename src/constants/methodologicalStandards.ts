// ─── Methodological Standards checklist ────────────────────────────────────────
// Data model + scoring logic for the "Methodological Standards" section of the
// data-submission survey (SurveyPage.tsx / MethodStandardsSection.tsx).
//
// This checklist is independent of the `study_metadata_dictionary.csv`-driven
// "Study metadata" section: it is a fixed, hardcoded set of questions (not
// editable via the S3 dictionary), used only to give submitters a live
// Gold/Silver/Bronze quality estimate. The calculated score/tier itself is
// NOT submitted — only the raw yes/no/n-a answers are, so the score can be
// recalculated downstream if the scoring rules change.

export type ChecklistAnswer = 'yes' | 'no' | 'na';

export interface ChecklistQuestion {
  id: string;
  text: string;
  note?: string;
  /** Whether an "N/A" option is offered alongside Yes/No. */
  na: boolean;
  /** If set, this question is only shown when the answer to `dependsOn` equals `showWhen`. */
  dependsOn?: string;
  showWhen?: ChecklistAnswer;
}

export interface ChecklistSubsection {
  title?: string;
  questions: ChecklistQuestion[];
}

export interface ChecklistSection {
  key: string;
  label: string;
  subsections: ChecklistSubsection[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    key: 'response',
    label: 'Response variable',
    subsections: [
      {
        title: 'Sampling',
        questions: [
          {
            id: 'response.0',
            text: 'Was response data collected through a structured/planned survey?',
            note: 'Expert elicitation counts as structured.',
            na: false,
          },
          {
            id: 'response.1',
            text: 'Was sampling bias of the survey corrected?',
            na: true,
          },
          {
            id: 'response.2',
            text: 'Was species detectability incorporated in the analysis?',
            na: true,
          },
        ],
      },
      {
        title: 'Spatial accuracy',
        questions: [
          {
            id: 'response.3',
            text: 'Were the records filtered to remove implausible locations?',
            na: false,
          },
          {
            id: 'response.4',
            text: 'Was the response sampled across the environmental extent of the targeted predicted area?',
            na: false,
          },
        ],
      },
    ],
  },
  {
    key: 'predictor',
    label: 'Predictor variable',
    subsections: [
      {
        title: 'Selection of candidate',
        questions: [
          {
            id: 'predictor.0',
            text: 'Was correlation and/or collinearity between predictors tested and addressed?',
            na: false,
          },
          {
            id: 'predictor.1',
            text: 'Were candidate spatial predictors selected based on well-defined and explained ecological relationships between species and the environment?',
            na: false,
          },
          {
            id: 'predictor.2',
            text: 'Is the spatial uncertainty of your response smaller than the resolution of your spatial predictor?',
            na: true,
          },
        ],
      },
    ],
  },
  {
    key: 'modelbuilding',
    label: 'Model building',
    subsections: [
      {
        title: 'Modelling assumptions',
        questions: [
          {
            id: 'modelbuilding.0',
            text: 'Did the dataset and experimental design satisfy all assumptions of the specific modelling form chosen?',
            na: false,
          },
        ],
      },
    ],
  },
  {
    key: 'evaluation',
    label: 'Model evaluation / validation',
    subsections: [
      {
        questions: [
          { id: 'evaluation.0', text: 'Did you validate the model predictions?', na: false },
          { id: 'evaluation.1', text: 'Was an independent dataset used to validate predictions of the model?', na: false },
          {
            id: 'evaluation.2',
            text: 'Was a train/test partition used to validate the model?',
            na: false,
            dependsOn: 'evaluation.1',
            showWhen: 'no',
          },
          {
            id: 'evaluation.3',
            text: 'Was spatial or environmental block cross-validation used when designing the train/test partition?',
            na: false,
            dependsOn: 'evaluation.2',
            showWhen: 'yes',
          },
          { id: 'evaluation.4', text: 'Were multiple model evaluation metrics used to test model performance?', na: false },
        ],
      },
    ],
  },
];

export const ALL_QUESTIONS: ChecklistQuestion[] = CHECKLIST_SECTIONS.flatMap((s) =>
  s.subsections.flatMap((sub) => sub.questions)
);

export const ALL_QUESTION_IDS: string[] = ALL_QUESTIONS.map((q) => q.id);

export function isQuestionVisible(qid: string, answers: Record<string, ChecklistAnswer | undefined>): boolean {
  const q = ALL_QUESTIONS.find((x) => x.id === qid);
  if (!q) return false;
  if (!q.dependsOn) return true;
  return answers[q.dependsOn] === q.showWhen;
}

export function visibleQuestionIds(answers: Record<string, ChecklistAnswer | undefined>): string[] {
  return ALL_QUESTION_IDS.filter((qid) => isQuestionVisible(qid, answers));
}

function sectionScore(sectionKey: string, answers: Record<string, ChecklistAnswer | undefined>): number | null {
  const section = CHECKLIST_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) return null;
  const qids = section.subsections.flatMap((sub) => sub.questions.map((q) => q.id)).filter((qid) => isQuestionVisible(qid, answers));
  let yesCount = 0;
  let denom = 0;
  qids.forEach((qid) => {
    const v = answers[qid];
    if (v === 'na') return;
    denom++;
    if (v === 'yes') yesCount++;
  });
  return denom > 0 ? yesCount / denom : null;
}

export type ChecklistTier = 'gold' | 'silver' | 'bronze';

export interface ChecklistResult {
  tier: ChecklistTier;
  overallPct: number;
  sectionScores: Record<string, number | null>;
  overrideNote: string | null;
}

export function calculateChecklistResult(answers: Record<string, ChecklistAnswer | undefined>): ChecklistResult {
  const sectionScores: Record<string, number | null> = {};
  CHECKLIST_SECTIONS.forEach((s) => {
    sectionScores[s.key] = sectionScore(s.key, answers);
  });

  const validScores = Object.values(sectionScores).filter((s): s is number => s !== null);
  const overall = validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
  const overallPct = Math.round(overall * 100);

  let tier: ChecklistTier;
  let overrideNote: string | null = null;
  if (answers['evaluation.0'] === 'no') {
    tier = 'bronze';
    overrideNote = 'Set to Bronze automatically because model predictions were not validated.';
  } else if (overallPct >= 85) {
    tier = 'gold';
  } else if (overallPct >= 60) {
    tier = 'silver';
  } else {
    tier = 'bronze';
  }

  return { tier, overallPct, sectionScores, overrideNote };
}

/** Prefix applied to checklist answer keys in the submission payload, to keep
 * them clearly distinct from the study-metadata-dictionary-driven fields. */
export const STANDARDS_KEY_PREFIX = 'standards.';

/**
 * Extracts checklist answers from a submission-shaped payload (keys prefixed
 * with STANDARDS_KEY_PREFIX, e.g. from an approved-metadata JSON file) back
 * into the bare-qid answers record calculateChecklistResult expects.
 */
export function answersFromPayload(
  payload: Record<string, string> | undefined
): Record<string, ChecklistAnswer | undefined> {
  const answers: Record<string, ChecklistAnswer | undefined> = {};
  if (!payload) return answers;
  for (const qid of ALL_QUESTION_IDS) {
    const value = payload[`${STANDARDS_KEY_PREFIX}${qid}`];
    if (value === 'yes' || value === 'no' || value === 'na') answers[qid] = value;
  }
  return answers;
}

/**
 * Calculates the Gold/Silver/Bronze result from a submission-shaped payload,
 * or null if it contains no usable checklist answers at all (metadata not
 * uploaded, or nothing yet answered) — callers should treat null as "unknown".
 */
export function calculateChecklistResultFromPayload(
  payload: Record<string, string> | undefined
): ChecklistResult | null {
  const answers = answersFromPayload(payload);
  const hasAnyAnswer = Object.values(answers).some((v) => v !== undefined);
  if (!hasAnyAnswer) return null;
  return calculateChecklistResult(answers);
}

/** Current version of the submission form. Bump when the question set changes. */
export const SURVEY_FORM_VERSION = '2.0';
