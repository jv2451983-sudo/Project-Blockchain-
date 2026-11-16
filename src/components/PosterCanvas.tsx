import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pencil,
  X,
} from 'lucide-react';
import { POSTER_FORMATS, POSTER_THEMES } from '../data/posterThemes';
import { PosterDocument, PosterSection, PosterThemeTokens } from '../types/poster';
import { PosterChart } from './PosterChart';
import { PosterQrBlock } from './PosterQrBlock';

interface PosterCanvasProps {
  poster: PosterDocument;
  zoom: number;
  selectedSectionId: string | null;
  isPresenting: boolean;
  onExitPresent: () => void;
  onSelectSection: (sectionId: string) => void;
  onEditSection: (sectionId: string) => void;
}

const ResilientPosterImage: React.FC<{
  src: string;
  alt: string;
  aspect: '16:9' | '4:3';
}> = ({ src, alt, aspect }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const aspectClass = aspect === '16:9' ? 'aspect-video' : 'aspect-4/3';

  if (failed || !src) {
    return (
      <div
        className={`${aspectClass} w-full rounded-md border border-stone-200 bg-stone-100 flex flex-col items-center justify-center gap-2 p-4 text-center`}
      >
        <ImageOff className="w-6 h-6 text-stone-400" aria-hidden="true" />
        <p className="text-xs font-medium text-stone-600 max-w-xs">{alt || 'Figure image unavailable'}</p>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} w-full overflow-hidden rounded-md border border-stone-200 bg-stone-50`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const PosterSectionCard: React.FC<{
  section: PosterSection;
  theme: PosterThemeTokens;
  isSelected: boolean;
  isPresenting: boolean;
  onSelect: () => void;
  onEdit: () => void;
}> = ({ section, theme, isSelected, isPresenting, onSelect, onEdit }) => {
  return (
    <article
      onClick={onSelect}
      className={`group relative bg-white border transition-colors rounded-lg p-5 ${
        isSelected && !isPresenting
          ? `${theme.accentBorderClass} ring-1 ring-stone-900/20`
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-start justify-between gap-3 pb-3 mb-3.5 border-b border-stone-200">
        <h3 className="font-serif text-[17px] font-semibold text-stone-900 leading-snug">
          <span className={`font-mono text-xs mr-2 ${theme.accentTextClass}`}>
            {section.number}.
          </span>
          {section.title}
        </h3>

        {!isPresenting && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${section.title}`}
            className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-opacity shrink-0"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Section Content by Kind */}
      {section.kind === 'prose' && (
        <p className="text-[13.5px] leading-[1.65] text-stone-700 whitespace-pre-line">
          {section.body}
        </p>
      )}

      {section.kind === 'bullets' && (
        <ul className="space-y-2.5 text-[13.5px] leading-[1.58] text-stone-700">
          {(section.bullets || []).map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span
                className="font-mono text-[11px] font-semibold mt-1 shrink-0 tabular-nums"
                style={{ color: theme.accentHex }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {section.kind === 'metrics' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {(section.metrics || []).map((metric) => (
            <div
              key={metric.id}
              className="pt-2.5 border-t border-stone-100 first:border-t-0 nth-2:border-t-0"
            >
              <div className="text-[11px] font-medium text-stone-500 leading-tight">
                {metric.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="font-serif text-2xl font-bold tracking-tight tabular-nums"
                  style={{ color: theme.accentHex }}
                >
                  {metric.value}
                </span>
                <span className="text-xs font-mono text-stone-600">{metric.unit}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-stone-500 leading-snug">
                {metric.context}
              </p>
            </div>
          ))}
        </div>
      )}

      {section.kind === 'chart' && section.chart && (
        <PosterChart chart={section.chart} theme={theme} />
      )}

      {section.kind === 'figure' && section.figure && (
        <figure className="space-y-2.5">
          <ResilientPosterImage
            src={section.figure.imageUrl}
            alt={section.figure.caption}
            aspect={section.figure.aspect}
          />
          <figcaption className="text-xs leading-relaxed text-stone-600">
            <span className="font-semibold text-stone-900 not-italic mr-1.5">
              {section.figure.figureNumber}
            </span>
            <span className="italic font-serif">{section.figure.caption}</span>
          </figcaption>
        </figure>
      )}

      {section.kind === 'references' && (
        <ol className="space-y-2 text-[12px] leading-relaxed text-stone-600">
          {(section.references || []).map((ref, idx) => (
            <li key={idx}>{ref}</li>
          ))}
        </ol>
      )}
    </article>
  );
};

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  poster,
  zoom,
  selectedSectionId,
  isPresenting,
  onExitPresent,
  onSelectSection,
  onEditSection,
}) => {
  const theme = POSTER_THEMES[poster.theme];
  const format = POSTER_FORMATS[poster.format];
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    if (!isPresenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitPresent();
      } else if (e.key === 'ArrowRight') {
        setSpotlightIndex((prev) => Math.min(poster.sections.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSpotlightIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, poster.sections.length, onExitPresent]);

  const effectiveCols =
    poster.layout === 'two-column' || poster.format === 'a1-portrait' ? 2 : 3;

  const getColumnSections = (colIdx: number) => {
    if (effectiveCols === 2) {
      return poster.sections.filter((s) =>
        colIdx === 1 ? s.column === 1 : s.column === 2 || s.column === 3
      );
    }
    return poster.sections.filter((s) => s.column === colIdx);
  };

  const renderPosterSheet = () => (
    <div
      className={`print-poster-container mx-auto bg-[#FCFBF8] border border-stone-300 shadow-[0_12px_40px_-16px_rgba(28,25,23,0.18)] rounded-xl overflow-hidden ${format.maxWidthClass}`}
      style={
        !isPresenting && zoom !== 100
          ? { transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }
          : undefined
      }
    >
      {/* Institutional Poster Masthead */}
      <div className={`${theme.mastheadBgClass} ${theme.mastheadTextClass} px-8 py-7 border-b border-black/10`}>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs tracking-wide pb-4 mb-5 border-b border-white/15">
          <div className={`flex flex-wrap items-center gap-2 ${theme.mastheadMutedClass}`}>
            <span className="font-mono font-semibold text-white">{poster.posterCode}</span>
            <span aria-hidden="true">·</span>
            <span>{poster.discipline}</span>
            <span aria-hidden="true">·</span>
            <span>{poster.eventTitle}</span>
          </div>
          <div className={`font-mono text-[11px] tabular-nums ${theme.mastheadMutedClass}`}>
            {format.label} ({format.dimensions})
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-9 space-y-2.5">
            <h1 className="font-serif text-3xl lg:text-[38px] font-bold leading-[1.15] tracking-tight text-balance">
              {poster.title}
            </h1>
            <p className={`text-sm lg:text-base leading-relaxed max-w-4xl ${theme.mastheadMutedClass}`}>
              {poster.subtitle}
            </p>
          </div>

          <div className="lg:col-span-3 lg:text-right text-xs space-y-1">
            <div className="font-semibold text-white">{poster.department}</div>
            <div className={theme.mastheadMutedClass}>{poster.institution}</div>
            <div className={`pt-1 ${theme.mastheadMutedClass}`}>
              Advisor: <span className="text-white font-medium">{poster.advisor}</span>
            </div>
          </div>
        </div>

        {/* Author Roster */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          {poster.authors.map((author) => (
            <div key={author.id} className="flex items-baseline gap-1.5">
              <span className="font-semibold text-white">{author.name}</span>
              <span className={theme.mastheadMutedClass}>
                ({author.role} · {author.affiliation})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Poster Content Body */}
      <div className="p-6 lg:p-8">
        {poster.layout === 'showcase-grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {poster.sections.map((section) => {
              const spanClass =
                section.kind === 'chart' || section.kind === 'figure'
                  ? 'lg:col-span-2'
                  : 'lg:col-span-1';
              return (
                <div key={section.id} className={spanClass}>
                  <PosterSectionCard
                    section={section}
                    theme={theme}
                    isSelected={selectedSectionId === section.id}
                    isPresenting={isPresenting}
                    onSelect={() => onSelectSection(section.id)}
                    onEdit={() => onEditSection(section.id)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 items-start ${
              effectiveCols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
            }`}
          >
            {Array.from({ length: effectiveCols }, (_, i) => i + 1).map((colNum) => (
              <div key={colNum} className="space-y-5">
                {getColumnSections(colNum).map((section) => (
                  <PosterSectionCard
                    key={section.id}
                    section={section}
                    theme={theme}
                    isSelected={selectedSectionId === section.id}
                    isPresenting={isPresenting}
                    onSelect={() => onSelectSection(section.id)}
                    onEdit={() => onEditSection(section.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Poster Institutional Footer */}
      <div className="px-8 py-4 bg-stone-100/80 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-stone-900">{poster.eventDate}</span>
          <span aria-hidden="true">·</span>
          <span>Correspondence: {poster.contactEmail}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-stone-500">{poster.repositoryUrl}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] text-stone-500">
            <div className="font-medium text-stone-800">Dataset & Supplementary</div>
            <div className="font-mono">{poster.posterCode}</div>
          </div>
          <PosterQrBlock value={poster.repositoryUrl} accentHex={theme.accentHex} />
        </div>
      </div>
    </div>
  );

  if (isPresenting) {
    const activeSection = poster.sections[spotlightIndex] || poster.sections[0];
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/95 text-stone-100 flex flex-col">
        {/* Presentation Control Bar */}
        <div className="px-6 py-3.5 border-b border-stone-800 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="text-xs text-stone-400 font-mono truncate">
              {poster.posterCode} · {poster.title}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono tabular-nums text-stone-400">
              Section {spotlightIndex + 1} / {poster.sections.length}
            </span>
            <button
              type="button"
              onClick={() => setSpotlightIndex((i) => Math.max(0, i - 1))}
              disabled={spotlightIndex === 0}
              aria-label="Previous section"
              className="p-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 hover:bg-stone-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSpotlightIndex((i) => Math.min(poster.sections.length - 1, i + 1))
              }
              disabled={spotlightIndex >= poster.sections.length - 1}
              aria-label="Next section"
              className="p-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 hover:bg-stone-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onExitPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-stone-900 text-xs font-medium hover:bg-stone-200"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Focused Section Spotlight + Full Poster Overview */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {activeSection && (
              <div className="bg-white text-stone-900 rounded-xl p-6 shadow-2xl">
                <PosterSectionCard
                  section={activeSection}
                  theme={theme}
                  isSelected={false}
                  isPresenting={true}
                  onSelect={() => {}}
                  onEdit={() => {}}
                />
              </div>
            )}

            {/* Quick jump strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {poster.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSpotlightIndex(idx)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    idx === spotlightIndex
                      ? 'bg-white text-stone-900'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {sec.number}. {sec.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 overflow-x-auto">
      {renderPosterSheet()}
    </div>
  );
};
