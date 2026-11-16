import React, { useRef } from 'react';
import {
  Download,
  Maximize2,
  RotateCcw,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { POSTER_FORMATS, POSTER_THEMES } from '../data/posterThemes';
import { PosterFormatId, PosterLayoutId, PosterThemeId } from '../types/poster';

interface WorkspaceToolbarProps {
  layout: PosterLayoutId;
  theme: PosterThemeId;
  format: PosterFormatId;
  zoom: number;
  onChangeLayout: (layout: PosterLayoutId) => void;
  onChangeTheme: (theme: PosterThemeId) => void;
  onChangeFormat: (format: PosterFormatId) => void;
  onChangeZoom: (zoom: number) => void;
  onPresentFullscreen: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetPoster: () => void;
}

const LAYOUT_OPTIONS: { id: PosterLayoutId; label: string }[] = [
  { id: 'three-column', label: '3-Column' },
  { id: 'two-column', label: '2-Column' },
  { id: 'showcase-grid', label: 'Showcase' },
];

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  layout,
  theme,
  format,
  zoom,
  onChangeLayout,
  onChangeTheme,
  onChangeFormat,
  onChangeZoom,
  onPresentFullscreen,
  onExportJson,
  onImportJson,
  onResetPoster,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="no-print bg-white border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left group: Layout & Format & Color Theme */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Segmented Layout Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg" role="group" aria-label="Poster grid layout">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeLayout(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                  layout === opt.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Paper Size Selector */}
          <label className="flex items-center gap-2 text-xs text-stone-600">
            <span className="font-medium text-stone-500 whitespace-nowrap">Sheet</span>
            <select
              value={format}
              onChange={(e) => onChangeFormat(e.target.value as PosterFormatId)}
              aria-label="Poster sheet format"
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              {Object.values(POSTER_FORMATS).map((fmt) => (
                <option key={fmt.id} value={fmt.id}>
                  {fmt.label} ({fmt.dimensions})
                </option>
              ))}
            </select>
          </label>

          {/* Theme Swatches */}
          <div className="flex items-center gap-2" role="group" aria-label="Poster accent palette">
            <span className="text-xs font-medium text-stone-500 whitespace-nowrap">Palette</span>
            <div className="flex items-center gap-1.5">
              {Object.values(POSTER_THEMES).map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTheme(t.id)}
                    title={t.label}
                    aria-label={`Select ${t.label} palette`}
                    aria-pressed={active}
                    className={`w-6 h-6 rounded-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-stone-900 ${
                      active ? 'ring-2 ring-offset-1 ring-stone-900 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.accentHex }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right group: Zoom, JSON Export/Import, Reset, Present */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
            <button
              type="button"
              onClick={() => onChangeZoom(Math.max(60, zoom - 10))}
              aria-label="Zoom out"
              className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-40"
              disabled={zoom <= 60}
            >
              <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="px-2 text-xs font-mono tabular-nums text-stone-700 min-w-[46px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => onChangeZoom(Math.min(120, zoom + 10))}
              aria-label="Zoom in"
              className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-40"
              disabled={zoom >= 120}
            >
              <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJson(file);
                e.target.value = '';
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetPoster}
            title="Restore template defaults"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onPresentFullscreen}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Present Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
