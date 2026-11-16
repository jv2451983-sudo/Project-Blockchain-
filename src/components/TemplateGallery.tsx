import React from 'react';
import { Check } from 'lucide-react';
import { POSTER_TEMPLATES } from '../data/posterTemplates';
import { POSTER_THEMES } from '../data/posterThemes';
import { PosterDocument } from '../types/poster';

interface TemplateGalleryProps {
  currentPosterId: string;
  onLoadTemplate: (template: PosterDocument) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  currentPosterId,
  onLoadTemplate,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="pb-6 border-b border-stone-200">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Curated Project Poster Templates
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Start from a complete discipline-specific poster structure with pre-formatted sections, figures, and comparison charts.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {POSTER_TEMPLATES.map((tpl) => {
          const theme = POSTER_THEMES[tpl.theme];
          const isCurrent = tpl.id === currentPosterId;
          const figureSection = tpl.sections.find((s) => s.kind === 'figure' && s.figure);

          return (
            <article
              key={tpl.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Preview Banner */}
                <div className="p-4 bg-stone-100 border-b border-stone-200">
                  {figureSection?.figure ? (
                    <div className="aspect-4/3 rounded-md overflow-hidden border border-stone-200 bg-white">
                      <img
                        src={figureSection.figure.imageUrl}
                        alt={tpl.templateName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-4/3 rounded-md flex items-center justify-center text-white font-serif text-lg p-6 text-center"
                      style={{ backgroundColor: theme.accentHex }}
                    >
                      {tpl.templateName}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <span className="font-mono text-stone-700">{tpl.posterCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tpl.discipline}</span>
                  </div>

                  <h2 className="font-serif text-lg font-semibold text-stone-900 leading-snug">
                    {tpl.title}
                  </h2>

                  <p className="text-xs text-stone-600 leading-relaxed">{tpl.subtitle}</p>

                  <div className="pt-2 text-xs text-stone-500 flex items-center gap-2">
                    <span className="tabular-nums">{tpl.sections.length} sections</span>
                    <span aria-hidden="true">·</span>
                    <span>{tpl.authors.length} authors</span>
                    <span aria-hidden="true">·</span>
                    <span>{theme.label}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <button
                  type="button"
                  onClick={() => onLoadTemplate(tpl)}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-stone-100 text-stone-900 border border-stone-300 hover:bg-stone-200'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {isCurrent && <Check className="w-4 h-4" aria-hidden="true" />}
                  <span>{isCurrent ? 'Reload Default Template' : 'Use This Template'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
