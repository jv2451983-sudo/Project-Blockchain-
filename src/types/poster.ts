export type PosterThemeId = 'lapis' | 'terracotta' | 'forest' | 'graphite';

export type PosterLayoutId = 'three-column' | 'two-column' | 'showcase-grid';

export type PosterFormatId = 'a0-landscape' | 'conference-48x36' | 'a1-portrait';

export type PosterSectionKind =
  | 'prose'
  | 'bullets'
  | 'metrics'
  | 'chart'
  | 'figure'
  | 'references';

export interface PosterAuthor {
  id: string;
  name: string;
  role: string;
  affiliation: string;
}

export interface PosterMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  context: string;
}

export interface PosterChartDatum {
  id: string;
  label: string;
  primaryValue: number;
  baselineValue: number;
}

export interface PosterChartSpec {
  title: string;
  subtitle: string;
  primarySeriesLabel: string;
  baselineSeriesLabel: string;
  unit: string;
  data: PosterChartDatum[];
}

export interface PosterFigureSpec {
  imageUrl: string;
  figureNumber: string;
  caption: string;
  aspect: '16:9' | '4:3';
}

export interface PosterSection {
  id: string;
  number: string;
  title: string;
  column: 1 | 2 | 3;
  kind: PosterSectionKind;
  body?: string;
  bullets?: string[];
  metrics?: PosterMetric[];
  chart?: PosterChartSpec;
  figure?: PosterFigureSpec;
  references?: string[];
}

export interface PosterDocument {
  id: string;
  templateName: string;
  discipline: string;
  posterCode: string;
  title: string;
  subtitle: string;
  institution: string;
  department: string;
  eventTitle: string;
  eventDate: string;
  advisor: string;
  contactEmail: string;
  repositoryUrl: string;
  authors: PosterAuthor[];
  theme: PosterThemeId;
  layout: PosterLayoutId;
  format: PosterFormatId;
  sections: PosterSection[];
  updatedAt: string;
}

export interface PosterThemeTokens {
  id: PosterThemeId;
  label: string;
  accentHex: string;
  accentTextClass: string;
  accentBgClass: string;
  accentSoftBgClass: string;
  accentBorderClass: string;
  mastheadBgClass: string;
  mastheadTextClass: string;
  mastheadMutedClass: string;
  chartPrimaryHex: string;
  chartBaselineHex: string;
}
