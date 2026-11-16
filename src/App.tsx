/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { PosterCanvas } from './components/PosterCanvas';
import { ReadinessChecklist } from './components/ReadinessChecklist';
import { SectionEditor } from './components/SectionEditor';
import { TemplateGallery } from './components/TemplateGallery';
import { StudioView, TopBar } from './components/TopBar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { POSTER_TEMPLATES } from './data/posterTemplates';
import { PosterDocument } from './types/poster';

const STORAGE_POSTER_KEY = 'symposium-folio-poster-v1';
const STORAGE_CHECKS_KEY = 'symposium-folio-checks-v1';

function loadInitialPoster(): PosterDocument {
  try {
    const raw = localStorage.getItem(STORAGE_POSTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PosterDocument;
      if (parsed && parsed.title && Array.isArray(parsed.sections)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default template
  }
  return structuredClone(POSTER_TEMPLATES[0]);
}

function loadInitialChecks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHECKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage error
  }
  return [];
}

export default function App() {
  const [poster, setPoster] = useState<PosterDocument>(loadInitialPoster);
  const [checkedIds, setCheckedIds] = useState<string[]>(loadInitialChecks);
  const [activeView, setActiveView] = useState<StudioView>('canvas');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    () => loadInitialPoster().sections[0]?.id || null
  );
  const [zoom, setZoom] = useState<number>(100);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POSTER_KEY, JSON.stringify(poster));
    } catch {
      // Ignore quota errors
    }
  }, [poster]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHECKS_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore quota errors
    }
  }, [checkedIds]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const handlePrint = () => {
    if (activeView !== 'canvas') {
      setActiveView('canvas');
      window.setTimeout(() => window.print(), 120);
    } else {
      window.print();
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(poster, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poster.posterCode.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Poster JSON exported.');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PosterDocument;
        if (!parsed.title || !Array.isArray(parsed.sections)) {
          showNotice('Invalid poster JSON structure.');
          return;
        }
        setPoster(parsed);
        setSelectedSectionId(parsed.sections[0]?.id || null);
        showNotice(`Loaded "${parsed.title}".`);
      } catch {
        showNotice('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetPoster = () => {
    const match =
      POSTER_TEMPLATES.find((t) => t.id === poster.id) || POSTER_TEMPLATES[0];
    const fresh = structuredClone(match);
    setPoster(fresh);
    setSelectedSectionId(fresh.sections[0]?.id || null);
    showNotice('Poster restored to template defaults.');
  };

  const handleLoadTemplate = (template: PosterDocument) => {
    const fresh = structuredClone(template);
    setPoster(fresh);
    setSelectedSectionId(fresh.sections[0]?.id || null);
    setActiveView('canvas');
    showNotice(`Loaded template: ${fresh.templateName}`);
  };

  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-stone-900">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onPrint={handlePrint}
      />

      {activeView === 'canvas' && (
        <WorkspaceToolbar
          layout={poster.layout}
          theme={poster.theme}
          format={poster.format}
          zoom={zoom}
          onChangeLayout={(layout) => setPoster((p) => ({ ...p, layout }))}
          onChangeTheme={(theme) => setPoster((p) => ({ ...p, theme }))}
          onChangeFormat={(format) => setPoster((p) => ({ ...p, format }))}
          onChangeZoom={setZoom}
          onPresentFullscreen={() => setIsPresenting(true)}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onResetPoster={handleResetPoster}
        />
      )}

      {notice && (
        <div
          role="status"
          className="no-print fixed bottom-5 right-5 z-40 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg"
        >
          {notice}
        </div>
      )}

      <main className="flex-1">
        {activeView === 'canvas' && (
          <PosterCanvas
            poster={poster}
            zoom={zoom}
            selectedSectionId={selectedSectionId}
            isPresenting={isPresenting}
            onExitPresent={() => setIsPresenting(false)}
            onSelectSection={setSelectedSectionId}
            onEditSection={(secId) => {
              setSelectedSectionId(secId);
              setActiveView('editor');
            }}
          />
        )}

        {activeView === 'editor' && (
          <SectionEditor
            poster={poster}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onUpdatePoster={setPoster}
          />
        )}

        {activeView === 'templates' && (
          <TemplateGallery
            currentPosterId={poster.id}
            onLoadTemplate={handleLoadTemplate}
          />
        )}

        {activeView === 'checklist' && (
          <ReadinessChecklist
            poster={poster}
            checkedIds={checkedIds}
            onToggleCheck={handleToggleCheck}
            onGoToEditor={() => setActiveView('editor')}
          />
        )}
      </main>
    </div>
  );
}
