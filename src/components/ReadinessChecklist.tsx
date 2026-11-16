import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { PosterDocument } from '../types/poster';

interface ReadinessChecklistProps {
  poster: PosterDocument;
  checkedIds: string[];
  onToggleCheck: (id: string) => void;
  onGoToEditor: () => void;
}

const SYMPOSIUM_RUBRIC_ITEMS = [
  {
    id: 'rubric-distance',
    title: '2-Meter Title & Heading Legibility',
    detail: 'Verify the project title fits cleanly on 1–2 lines and section numbers guide readers left-to-right.',
  },
  {
    id: 'rubric-pitch',
    title: '90-Second Elevator Walkthrough Prepared',
    detail: 'Practice stepping through Problem -> Method -> Quantitative Proof -> Conclusion using Present Mode.',
  },
  {
    id: 'rubric-figures',
    title: 'All Figures Numbered & Captioned',
    detail: 'Confirm every diagram or photo has a Fig. number, scale context, and crisp high-resolution source.',
  },
  {
    id: 'rubric-proof',
    title: 'Print Margin & Color Proof Checked',
    detail: 'Run Print / Export PDF and inspect the A0/A1 page preview for clean column alignment.',
  },
];

export const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({
  poster,
  checkedIds,
  onToggleCheck,
  onGoToEditor,
}) => {
  // Compute real live diagnostics from the active poster document
  const wordCount = poster.sections.reduce((total, sec) => {
    const proseWords = sec.body ? sec.body.trim().split(/\s+/).length : 0;
    const bulletWords = (sec.bullets || []).join(' ').trim().split(/\s+/).filter(Boolean).length;
    const captionWords = sec.figure?.caption ? sec.figure.caption.trim().split(/\s+/).length : 0;
    return total + proseWords + bulletWords + captionWords;
  }, 0);

  const hasFigure = poster.sections.some((s) => s.kind === 'figure' && s.figure?.imageUrl);
  const hasChartOrMetrics = poster.sections.some(
    (s) => s.kind === 'chart' || s.kind === 'metrics'
  );
  const hasReferences = poster.sections.some(
    (s) => s.kind === 'references' && (s.references?.length || 0) > 0
  );
  const hasAuthors = poster.authors.length > 0 && poster.advisor.trim().length > 0;

  const autoChecks = [
    {
      label: 'Total Poster Word Budget (Ideal: 250–650 words)',
      passed: wordCount >= 180 && wordCount <= 750,
      reading: `${wordCount} words across ${poster.sections.length} sections`,
    },
    {
      label: 'Visual Evidence (Diagram or Field Photograph)',
      passed: hasFigure,
      reading: hasFigure ? 'Included' : 'Missing figure section',
    },
    {
      label: 'Quantitative Results (Chart or KPI Grid)',
      passed: hasChartOrMetrics,
      reading: hasChartOrMetrics ? 'Included' : 'Add chart or metric grid',
    },
    {
      label: 'Author Roster & Faculty Advisor Attribution',
      passed: hasAuthors,
      reading: `${poster.authors.length} author(s) · ${poster.advisor || 'No advisor'}`,
    },
    {
      label: 'Citations & Acknowledgments Block',
      passed: hasReferences,
      reading: hasReferences ? 'Included' : 'Missing references block',
    },
  ];

  const completedManual = SYMPOSIUM_RUBRIC_ITEMS.filter((item) =>
    checkedIds.includes(item.id)
  ).length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            Symposium Poster Readiness Check
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Automated structural audit of your current poster paired with final presentation preparation checks.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToEditor}
          className="px-4 py-2 text-sm font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 whitespace-nowrap"
        >
          Edit Poster Content
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Automated Structural Diagnostics */}
        <section className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Automated Poster Diagnostics
            </h2>
            <span className="text-xs font-mono tabular-nums text-stone-500">
              {autoChecks.filter((c) => c.passed).length} / {autoChecks.length} satisfied
            </span>
          </div>

          <ul className="divide-y divide-stone-100">
            {autoChecks.map((check) => (
              <li key={check.label} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      check.passed ? 'text-emerald-700' : 'text-amber-600'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-medium text-stone-900">{check.label}</div>
                    <div className="text-xs font-mono tabular-nums text-stone-500 mt-0.5">
                      {check.reading}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    check.passed ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {check.passed ? 'Ready' : 'Needs Review'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Interactive Presenter Checklist */}
        <section className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Presenter & Print Checklist
            </h2>
            <span className="text-xs font-mono tabular-nums text-stone-500">
              {completedManual} / {SYMPOSIUM_RUBRIC_ITEMS.length} checked
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {SYMPOSIUM_RUBRIC_ITEMS.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleCheck(item.id)}
                  className="w-full py-3.5 flex items-start gap-3 text-left hover:bg-stone-50 px-2 -mx-2 rounded-lg transition-colors"
                >
                  {checked ? (
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0 text-stone-900"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="w-4 h-4 mt-0.5 shrink-0 text-stone-400"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        checked ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {item.title}
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
