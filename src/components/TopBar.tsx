import React from 'react';
import { Printer } from 'lucide-react';

export type StudioView = 'canvas' | 'editor' | 'templates' | 'checklist';

interface TopBarProps {
  activeView: StudioView;
  onSelectView: (view: StudioView) => void;
  onPrint: () => void;
}

const NAV_ITEMS: { id: StudioView; label: string }[] = [
  { id: 'canvas', label: 'Poster Canvas' },
  { id: 'editor', label: 'Section Editor' },
  { id: 'templates', label: 'Templates' },
  { id: 'checklist', label: 'Readiness Check' },
];

export const TopBar: React.FC<TopBarProps> = ({ activeView, onSelectView, onPrint }) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-[#F7F4EE]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('canvas')}
          className="font-serif text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded"
        >
          Symposium Folio
        </button>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Studio workspace views">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded ${
                  isActive
                    ? 'text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-stone-900"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile view switcher kept compact inside header bottom row only on small viewports */}
      <nav
        className="flex md:hidden items-center gap-4 px-6 pb-2.5 overflow-x-auto border-t border-stone-200/70 pt-2"
        aria-label="Mobile studio views"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 py-1 px-2.5 rounded-md transition-colors ${
                isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
