import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { AVAILABLE_FIGURES } from '../data/posterTemplates';
import {
  PosterAuthor,
  PosterDocument,
  PosterSection,
  PosterSectionKind,
} from '../types/poster';

interface SectionEditorProps {
  poster: PosterDocument;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onUpdatePoster: (updater: (prev: PosterDocument) => PosterDocument) => void;
}

const SECTION_KIND_LABELS: Record<PosterSectionKind, string> = {
  prose: 'Prose Narrative',
  bullets: 'Numbered Objectives / Points',
  metrics: 'Quantitative KPI Grid',
  chart: 'Grouped Comparison Chart',
  figure: 'Figure & Caption',
  references: 'Citations & Acknowledgments',
};

export const SectionEditor: React.FC<SectionEditorProps> = ({
  poster,
  selectedSectionId,
  onSelectSection,
  onUpdatePoster,
}) => {
  const [editorTab, setEditorTab] = useState<'sections' | 'masthead'>(
    selectedSectionId ? 'sections' : 'sections'
  );
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const activeSection =
    poster.sections.find((s) => s.id === selectedSectionId) || poster.sections[0] || null;

  const updateSection = (sectionId: string, patch: Partial<PosterSection>) => {
    onUpdatePoster((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
  };

  const handleAddSection = (kind: PosterSectionKind) => {
    const nextNum = String(poster.sections.length + 1).padStart(2, '0');
    const newId = `sec-${Date.now()}`;
    const baseSection: PosterSection = {
      id: newId,
      number: nextNum,
      title: `New ${SECTION_KIND_LABELS[kind]}`,
      column: 3,
      kind,
    };

    if (kind === 'prose') {
      baseSection.body = 'Summarize methodology, observations, or technical findings concisely for 1.5 m viewing distance.';
    } else if (kind === 'bullets') {
      baseSection.bullets = [
        'Primary deliverable or experimental milestone.',
        'Secondary validation criterion or performance benchmark.',
      ];
    } else if (kind === 'metrics') {
      baseSection.metrics = [
        { id: `m-${Date.now()}`, label: 'Primary Metric', value: '94.0', unit: '%', context: 'Measured across field trials' },
      ];
    } else if (kind === 'chart') {
      baseSection.chart = {
        title: 'Comparison Across Conditions',
        subtitle: 'Measured Prototype vs. Control Baseline',
        primarySeriesLabel: 'Prototype',
        baselineSeriesLabel: 'Baseline',
        unit: '%',
        data: [
          { id: `d1-${Date.now()}`, label: 'Trial A', primaryValue: 82, baselineValue: 61 },
          { id: `d2-${Date.now()}`, label: 'Trial B', primaryValue: 89, baselineValue: 64 },
        ],
      };
    } else if (kind === 'figure') {
      baseSection.figure = {
        imageUrl: AVAILABLE_FIGURES[0].url,
        figureNumber: `Fig. ${poster.sections.filter((s) => s.kind === 'figure').length + 1}`,
        caption: 'Descriptive caption explaining key callouts and physical scale.',
        aspect: '4:3',
      };
    } else if (kind === 'references') {
      baseSection.references = [
        '[1] Author, A. (2025). Foundational study title. Journal Name, 14(2), 45–59.',
      ];
    }

    onUpdatePoster((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: [...prev.sections, baseSection],
    }));
    onSelectSection(newId);
    setEditorTab('sections');
  };

  const handleMoveSection = (sectionId: string, direction: -1 | 1) => {
    const idx = poster.sections.findIndex((s) => s.id === sectionId);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= poster.sections.length) return;

    const reordered = [...poster.sections];
    const [item] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, item);

    const renumbered = reordered.map((sec, i) => ({
      ...sec,
      number: String(i + 1).padStart(2, '0'),
    }));

    onUpdatePoster((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: renumbered,
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    const remaining = poster.sections
      .filter((s) => s.id !== sectionId)
      .map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') }));

    onUpdatePoster((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: remaining,
    }));
    onSelectSection(remaining[0]?.id || null);
  };

  const handleImageUpload = (sectionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && activeSection?.figure) {
        updateSection(sectionId, {
          figure: { ...activeSection.figure, imageUrl: reader.result },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAuthor = () => {
    const newAuthor: PosterAuthor = {
      id: `auth-${Date.now()}`,
      name: 'New Researcher',
      role: 'Contributor',
      affiliation: poster.department,
    };
    onUpdatePoster((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      authors: [...prev.authors, newAuthor],
    }));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            Poster Content & Structure Editor
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Edit masthead details, reorder sections across columns, or update figures and chart series.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setEditorTab('sections')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              editorTab === 'sections'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Poster Sections ({poster.sections.length})
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('masthead')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              editorTab === 'masthead'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Masthead & Authors
          </button>
        </div>
      </div>

      {editorTab === 'masthead' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Title, Event & Institutional Attribution
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Poster Code</span>
                <input
                  type="text"
                  value={poster.posterCode}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, posterCode: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Discipline / Track</span>
                <input
                  type="text"
                  value={poster.discipline}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, discipline: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-stone-600">Project Poster Title</span>
              <input
                type="text"
                value={poster.title}
                onChange={(e) =>
                  onUpdatePoster((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-stone-600">Subtitle / Scope</span>
              <input
                type="text"
                value={poster.subtitle}
                onChange={(e) =>
                  onUpdatePoster((p) => ({ ...p, subtitle: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Department / Lab</span>
                <input
                  type="text"
                  value={poster.department}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, department: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Institution</span>
                <input
                  type="text"
                  value={poster.institution}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, institution: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Symposium / Event Name</span>
                <input
                  type="text"
                  value={poster.eventTitle}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, eventTitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Faculty Advisor</span>
                <input
                  type="text"
                  value={poster.advisor}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, advisor: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Contact Email</span>
                <input
                  type="email"
                  value={poster.contactEmail}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, contactEmail: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-600">Repository / QR URL</span>
                <input
                  type="url"
                  value={poster.repositoryUrl}
                  onChange={(e) =>
                    onUpdatePoster((p) => ({ ...p, repositoryUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Authors & Contributors
              </h2>
              <button
                type="button"
                onClick={handleAddAuthor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Author</span>
              </button>
            </div>

            <div className="space-y-3">
              {poster.authors.map((author, idx) => (
                <div
                  key={author.id}
                  className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500">
                      Author {String(idx + 1).padStart(2, '0')}
                    </span>
                    {poster.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePoster((p) => ({
                            ...p,
                            authors: p.authors.filter((a) => a.id !== author.id),
                          }))
                        }
                        aria-label={`Remove ${author.name}`}
                        className="text-stone-400 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={author.name}
                    placeholder="Full Name"
                    onChange={(e) =>
                      onUpdatePoster((p) => ({
                        ...p,
                        authors: p.authors.map((a) =>
                          a.id === author.id ? { ...a, name: e.target.value } : a
                        ),
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-md"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={author.role}
                      placeholder="Role"
                      onChange={(e) =>
                        onUpdatePoster((p) => ({
                          ...p,
                          authors: p.authors.map((a) =>
                            a.id === author.id ? { ...a, role: e.target.value } : a
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-md"
                    />
                    <input
                      type="text"
                      value={author.affiliation}
                      placeholder="Affiliation"
                      onChange={(e) =>
                        onUpdatePoster((p) => ({
                          ...p,
                          authors: p.authors.map((a) =>
                            a.id === author.id ? { ...a, affiliation: e.target.value } : a
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Rail: Section Outline & Add */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-stone-900">Poster Sections</h2>
              <span className="text-xs font-mono tabular-nums text-stone-500">
                {poster.sections.length} blocks
              </span>
            </div>

            <div className="space-y-1.5">
              {poster.sections.map((sec, idx) => {
                const isSelected = activeSection?.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSection(sec.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="text-xs font-medium truncate">
                        <span className="font-mono mr-1.5 opacity-75">{sec.number}.</span>
                        {sec.title}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        Column {sec.column} · {SECTION_KIND_LABELS[sec.kind]}
                      </div>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(sec.id, -1)}
                        disabled={idx === 0}
                        aria-label={`Move ${sec.title} up`}
                        className="p-1 rounded hover:bg-white/15 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(sec.id, 1)}
                        disabled={idx === poster.sections.length - 1}
                        aria-label={`Move ${sec.title} down`}
                        className="p-1 rounded hover:bg-white/15 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-200">
              <div className="text-xs font-medium text-stone-500 mb-2">Add New Section</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(SECTION_KIND_LABELS) as PosterSectionKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => handleAddSection(kind)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-left"
                  >
                    <Plus className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span className="truncate capitalize">{kind}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Active Section Detail Form */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6">
            {activeSection ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <div className="text-xs text-stone-500 font-mono">
                      Section {activeSection.number} · {SECTION_KIND_LABELS[activeSection.kind]}
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-stone-900 mt-0.5">
                      {activeSection.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(activeSection.id)}
                    disabled={poster.sections.length <= 1}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Delete Section</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="sm:col-span-2 block space-y-1.5">
                    <span className="text-xs font-medium text-stone-600">Section Heading</span>
                    <input
                      type="text"
                      value={activeSection.title}
                      onChange={(e) =>
                        updateSection(activeSection.id, { title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-600">Target Column</span>
                    <select
                      value={activeSection.column}
                      onChange={(e) =>
                        updateSection(activeSection.id, {
                          column: Number(e.target.value) as 1 | 2 | 3,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value={1}>Column 1 (Left)</option>
                      <option value={2}>Column 2 (Center)</option>
                      <option value={3}>Column 3 (Right)</option>
                    </select>
                  </label>
                </div>

                {/* Kind-specific editors */}
                {activeSection.kind === 'prose' && (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-600">
                      Section Body Copy
                    </span>
                    <textarea
                      rows={7}
                      value={activeSection.body || ''}
                      onChange={(e) =>
                        updateSection(activeSection.id, { body: e.target.value })
                      }
                      className="w-full px-3 py-2.5 text-sm leading-relaxed bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </label>
                )}

                {activeSection.kind === 'bullets' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-600">Bullet Points</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection(activeSection.id, {
                            bullets: [...(activeSection.bullets || []), 'New bullet point'],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-900 text-white rounded-md"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>
                    {(activeSection.bullets || []).map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-xs text-stone-500 pt-2.5 w-6">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <textarea
                          rows={2}
                          value={b}
                          onChange={(e) => {
                            const updated = [...(activeSection.bullets || [])];
                            updated[idx] = e.target.value;
                            updateSection(activeSection.id, { bullets: updated });
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSection(activeSection.id, {
                              bullets: (activeSection.bullets || []).filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          aria-label="Remove bullet"
                          className="p-2 text-stone-400 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection.kind === 'metrics' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-600">
                        Quantitative Findings
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection(activeSection.id, {
                            metrics: [
                              ...(activeSection.metrics || []),
                              {
                                id: `m-${Date.now()}`,
                                label: 'Metric Label',
                                value: '0.0',
                                unit: '%',
                                context: 'Measurement context',
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-900 text-white rounded-md"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Metric</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeSection.metrics || []).map((m, idx) => (
                        <div
                          key={m.id}
                          className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-stone-500">
                              Metric {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateSection(activeSection.id, {
                                  metrics: (activeSection.metrics || []).filter(
                                    (item) => item.id !== m.id
                                  ),
                                })
                              }
                              aria-label="Remove metric"
                              className="text-stone-400 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={m.label}
                            placeholder="Label"
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                metrics: (activeSection.metrics || []).map((item) =>
                                  item.id === m.id ? { ...item, label: e.target.value } : item
                                ),
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={m.value}
                              placeholder="Value"
                              onChange={(e) =>
                                updateSection(activeSection.id, {
                                  metrics: (activeSection.metrics || []).map((item) =>
                                    item.id === m.id ? { ...item, value: e.target.value } : item
                                  ),
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-200 rounded"
                            />
                            <input
                              type="text"
                              value={m.unit}
                              placeholder="Unit"
                              onChange={(e) =>
                                updateSection(activeSection.id, {
                                  metrics: (activeSection.metrics || []).map((item) =>
                                    item.id === m.id ? { ...item, unit: e.target.value } : item
                                  ),
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-200 rounded"
                            />
                          </div>
                          <input
                            type="text"
                            value={m.context}
                            placeholder="Context"
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                metrics: (activeSection.metrics || []).map((item) =>
                                  item.id === m.id ? { ...item, context: e.target.value } : item
                                ),
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection.kind === 'chart' && activeSection.chart && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-stone-600">Chart Title</span>
                        <input
                          type="text"
                          value={activeSection.chart.title}
                          onChange={(e) =>
                            updateSection(activeSection.id, {
                              chart: { ...activeSection.chart!, title: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-stone-600">Subtitle</span>
                        <input
                          type="text"
                          value={activeSection.chart.subtitle}
                          onChange={(e) =>
                            updateSection(activeSection.id, {
                              chart: { ...activeSection.chart!, subtitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-stone-600">Primary Series Label</span>
                        <input
                          type="text"
                          value={activeSection.chart.primarySeriesLabel}
                          onChange={(e) =>
                            updateSection(activeSection.id, {
                              chart: {
                                ...activeSection.chart!,
                                primarySeriesLabel: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="col-span-2 block space-y-1">
                          <span className="text-xs font-medium text-stone-600">Baseline Label</span>
                          <input
                            type="text"
                            value={activeSection.chart.baselineSeriesLabel}
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                chart: {
                                  ...activeSection.chart!,
                                  baselineSeriesLabel: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-xs font-medium text-stone-600">Unit</span>
                          <input
                            type="text"
                            value={activeSection.chart.unit}
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                chart: { ...activeSection.chart!, unit: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-600">Data Points</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSection(activeSection.id, {
                              chart: {
                                ...activeSection.chart!,
                                data: [
                                  ...activeSection.chart!.data,
                                  {
                                    id: `cd-${Date.now()}`,
                                    label: 'New Group',
                                    primaryValue: 50,
                                    baselineValue: 40,
                                  },
                                ],
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-900 text-white rounded-md"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Row</span>
                        </button>
                      </div>

                      {activeSection.chart.data.map((row) => (
                        <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                chart: {
                                  ...activeSection.chart!,
                                  data: activeSection.chart!.data.map((d) =>
                                    d.id === row.id ? { ...d, label: e.target.value } : d
                                  ),
                                },
                              })
                            }
                            className="col-span-5 px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={row.primaryValue}
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                chart: {
                                  ...activeSection.chart!,
                                  data: activeSection.chart!.data.map((d) =>
                                    d.id === row.id
                                      ? { ...d, primaryValue: Number(e.target.value) }
                                      : d
                                  ),
                                },
                              })
                            }
                            className="col-span-3 px-2.5 py-1.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={row.baselineValue}
                            onChange={(e) =>
                              updateSection(activeSection.id, {
                                chart: {
                                  ...activeSection.chart!,
                                  data: activeSection.chart!.data.map((d) =>
                                    d.id === row.id
                                      ? { ...d, baselineValue: Number(e.target.value) }
                                      : d
                                  ),
                                },
                              })
                            }
                            className="col-span-3 px-2.5 py-1.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSection(activeSection.id, {
                                chart: {
                                  ...activeSection.chart!,
                                  data: activeSection.chart!.data.filter(
                                    (d) => d.id !== row.id
                                  ),
                                },
                              })
                            }
                            aria-label="Delete chart row"
                            className="col-span-1 p-1.5 text-stone-400 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection.kind === 'figure' && activeSection.figure && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-stone-600">Figure Number</span>
                        <input
                          type="text"
                          value={activeSection.figure.figureNumber}
                          onChange={(e) =>
                            updateSection(activeSection.id, {
                              figure: {
                                ...activeSection.figure!,
                                figureNumber: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-stone-600">Aspect Frame</span>
                        <select
                          value={activeSection.figure.aspect}
                          onChange={(e) =>
                            updateSection(activeSection.id, {
                              figure: {
                                ...activeSection.figure!,
                                aspect: e.target.value as '16:9' | '4:3',
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                        >
                          <option value="4:3">4:3 Technical Diagram</option>
                          <option value="16:9">16:9 Wide Field Site</option>
                        </select>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-600">
                          Select Figure Asset or Upload Image
                        </span>
                        <input
                          ref={imageUploadRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(activeSection.id, file);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => imageUploadRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                        >
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Upload Local Image</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {AVAILABLE_FIGURES.map((fig) => {
                          const selected = activeSection.figure?.imageUrl === fig.url;
                          return (
                            <button
                              key={fig.id}
                              type="button"
                              onClick={() =>
                                updateSection(activeSection.id, {
                                  figure: {
                                    ...activeSection.figure!,
                                    imageUrl: fig.url,
                                    aspect: fig.aspect,
                                  },
                                })
                              }
                              className={`p-1.5 rounded-lg border text-left transition-colors ${
                                selected
                                  ? 'border-stone-900 bg-stone-100'
                                  : 'border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              <img
                                src={fig.url}
                                alt={fig.label}
                                referrerPolicy="no-referrer"
                                className="w-full aspect-4/3 object-cover rounded"
                              />
                              <div className="text-[11px] font-medium text-stone-700 mt-1.5 truncate">
                                {fig.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-stone-600">Figure Caption</span>
                      <textarea
                        rows={3}
                        value={activeSection.figure.caption}
                        onChange={(e) =>
                          updateSection(activeSection.id, {
                            figure: { ...activeSection.figure!, caption: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </label>
                  </div>
                )}

                {activeSection.kind === 'references' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-600">
                        Citations & Acknowledgments
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection(activeSection.id, {
                            references: [
                              ...(activeSection.references || []),
                              `[${(activeSection.references?.length || 0) + 1}] Citation entry.`,
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-900 text-white rounded-md"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Reference</span>
                      </button>
                    </div>
                    {(activeSection.references || []).map((ref, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={ref}
                          onChange={(e) => {
                            const next = [...(activeSection.references || [])];
                            next[idx] = e.target.value;
                            updateSection(activeSection.id, { references: next });
                          }}
                          className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSection(activeSection.id, {
                              references: (activeSection.references || []).filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          aria-label="Remove reference"
                          className="p-2 text-stone-400 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-stone-500">
                Select or add a section on the left to edit its content.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
