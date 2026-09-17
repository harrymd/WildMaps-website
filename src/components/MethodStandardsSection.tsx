import { useState } from 'react';
import {
  CHECKLIST_SECTIONS,
  calculateChecklistResult,
  isQuestionVisible,
  visibleQuestionIds,
  type ChecklistAnswer,
  type ChecklistQuestion,
} from '../constants/methodologicalStandards';

interface MethodStandardsSectionProps {
  answers: Record<string, ChecklistAnswer | undefined>;
  onAnswer: (qid: string, value: ChecklistAnswer) => void;
}

const TIER_META: Record<string, { emoji: string; name: string }> = {
  gold: { emoji: '🥇', name: 'Gold' },
  silver: { emoji: '🥈', name: 'Silver' },
  bronze: { emoji: '🥉', name: 'Bronze' },
};

function QuestionRow({ question, value, onAnswer, flagged }: {
  question: ChecklistQuestion;
  value: ChecklistAnswer | undefined;
  onAnswer: (qid: string, value: ChecklistAnswer) => void;
  flagged: boolean;
}) {
  const options: ChecklistAnswer[] = question.na ? ['yes', 'no', 'na'] : ['yes', 'no'];
  const optLabel: Record<ChecklistAnswer, string> = { yes: 'Yes', no: 'No', na: 'N/A' };

  return (
    <div className={`wm-question${flagged ? ' flagged' : ''}`}>
      <p className="wm-q-text">
        {question.text}
        {question.note && <span className="wm-q-note">{question.note}</span>}
      </p>
      <div className="wm-options">
        {options.map((opt) => {
          const id = `${question.id}.${opt}`;
          return (
            <div className={`wm-opt ${opt}`} key={opt}>
              <input
                type="radio"
                name={question.id}
                id={id}
                checked={value === opt}
                onChange={() => onAnswer(question.id, opt)}
              />
              <label htmlFor={id}>{optLabel[opt]}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MethodStandardsSection({ answers, onAnswer }: MethodStandardsSectionProps) {
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [showValidation, setShowValidation] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateChecklistResult> | null>(null);

  const visibleIds = visibleQuestionIds(answers);
  const answeredCount = visibleIds.filter((qid) => answers[qid]).length;
  const progressPct = visibleIds.length ? Math.round((answeredCount / visibleIds.length) * 100) : 0;
  const allAnswered = visibleIds.length > 0 && answeredCount === visibleIds.length;

  const handleCalculate = () => {
    const unanswered = visibleIds.filter((qid) => !answers[qid]);
    if (unanswered.length > 0) {
      setFlaggedIds(new Set(unanswered));
      setShowValidation(true);
      const firstEl = document.getElementById(`wm-q-${unanswered[0]}`);
      firstEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFlaggedIds(new Set());
    setShowValidation(false);
    setResult(calculateChecklistResult(answers));
  };

  return (
    <div>
      <div className="wm-progress-rail">
        <div className="wm-progress-track"><div className="wm-progress-fill" style={{ width: `${progressPct}%` }} /></div>
        <div className="wm-progress-label">
          <span>{answeredCount} of {visibleIds.length} answered</span>
          <span>{progressPct}%</span>
        </div>
      </div>

      {CHECKLIST_SECTIONS.map((section) => (
        <section key={section.key} className="mt-8">
          <div className="wm-section-head">
            <h2>{section.label}</h2>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>25% of section total</span>
          </div>
          {section.subsections.map((sub, i) => (
            <div className="wm-subsection mt-4" key={sub.title ?? i}>
              {sub.title && <h3>{sub.title}</h3>}
              {sub.questions.map((q) => {
                if (!isQuestionVisible(q.id, answers)) return null;
                return (
                  <div id={`wm-q-${q.id}`} key={q.id}>
                    <QuestionRow
                      question={q}
                      value={answers[q.id]}
                      onAnswer={onAnswer}
                      flagged={flaggedIds.has(q.id)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}

      <div className="mt-10 flex items-center gap-3 flex-wrap">
        <button type="button" className="wm-btn wm-btn-primary" onClick={handleCalculate} disabled={!allAnswered}>
          Calculate score
        </button>
      </div>
      {showValidation && (
        <p className="wm-validation-msg">Please answer every visible question before calculating your score.</p>
      )}

      {result && (
        <div className="wm-results">
          <div className={`wm-tile ${result.tier}`}>
            <span className="medal">{TIER_META[result.tier].emoji}</span>
            <p className="tier-name">{TIER_META[result.tier].name}</p>
            <p className="tier-score">{result.overallPct}% overall</p>
            {result.overrideNote && <div className="tier-override">{result.overrideNote}</div>}
            <p className="tier-next">Please scroll down to submit all your answers to our database.</p>
          </div>

          <div className="wm-breakdown">
            <h3>Section breakdown</h3>
            {CHECKLIST_SECTIONS.map((section) => {
              const s = result.sectionScores[section.key];
              const pct = s === null ? 0 : Math.round(s * 100);
              return (
                <div className="wm-bar-row" key={section.key}>
                  <div className="bar-label"><span>{section.label}</span><span>{s === null ? 'N/A' : `${pct}%`}</span></div>
                  <div className="wm-bar-track"><div className="wm-bar-fill" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>

          <div className="wm-tier-key">
            <span className="g"><i></i>Gold — 85% and above</span>
            <span className="s"><i></i>Silver — 60% to 84%</span>
            <span className="b"><i></i>Bronze — below 60%, or predictions not validated</span>
          </div>
        </div>
      )}
    </div>
  );
}
