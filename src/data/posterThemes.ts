import { PosterFormatId, PosterThemeId, PosterThemeTokens } from '../types/poster';

export const POSTER_THEMES: Record<PosterThemeId, PosterThemeTokens> = {
  lapis: {
    id: 'lapis',
    label: 'Deep Lapis',
    accentHex: '#1E3A8A',
    accentTextClass: 'text-[#1E3A8A]',
    accentBgClass: 'bg-[#1E3A8A]',
    accentSoftBgClass: 'bg-[#EFF4FF]',
    accentBorderClass: 'border-[#1E3A8A]/20',
    mastheadBgClass: 'bg-[#162B66]',
    mastheadTextClass: 'text-white',
    mastheadMutedClass: 'text-blue-200',
    chartPrimaryHex: '#1E3A8A',
    chartBaselineHex: '#94A3B8',
  },
  terracotta: {
    id: 'terracotta',
    label: 'Terracotta Ink',
    accentHex: '#9A3412',
    accentTextClass: 'text-[#9A3412]',
    accentBgClass: 'bg-[#9A3412]',
    accentSoftBgClass: 'bg-[#FFF5F0]',
    accentBorderClass: 'border-[#9A3412]/20',
    mastheadBgClass: 'bg-[#7C2D12]',
    mastheadTextClass: 'text-white',
    mastheadMutedClass: 'text-orange-200',
    chartPrimaryHex: '#9A3412',
    chartBaselineHex: '#A8A29E',
  },
  forest: {
    id: 'forest',
    label: 'Forest Archive',
    accentHex: '#14532D',
    accentTextClass: 'text-[#14532D]',
    accentBgClass: 'bg-[#14532D]',
    accentSoftBgClass: 'bg-[#F0F7F2]',
    accentBorderClass: 'border-[#14532D]/20',
    mastheadBgClass: 'bg-[#114225]',
    mastheadTextClass: 'text-white',
    mastheadMutedClass: 'text-emerald-200',
    chartPrimaryHex: '#14532D',
    chartBaselineHex: '#9CA3AF',
  },
  graphite: {
    id: 'graphite',
    label: 'Charcoal Slate',
    accentHex: '#18181B',
    accentTextClass: 'text-stone-900',
    accentBgClass: 'bg-stone-900',
    accentSoftBgClass: 'bg-stone-100',
    accentBorderClass: 'border-stone-300',
    mastheadBgClass: 'bg-stone-900',
    mastheadTextClass: 'text-white',
    mastheadMutedClass: 'text-stone-300',
    chartPrimaryHex: '#18181B',
    chartBaselineHex: '#A1A1AA',
  },
};

export const POSTER_FORMATS: Record<
  PosterFormatId,
  { id: PosterFormatId; label: string; dimensions: string; maxWidthClass: string }
> = {
  'a0-landscape': {
    id: 'a0-landscape',
    label: 'A0 Landscape',
    dimensions: '1189 × 841 mm',
    maxWidthClass: 'max-w-[1360px]',
  },
  'conference-48x36': {
    id: 'conference-48x36',
    label: '48 × 36 in Conference',
    dimensions: '1219 × 914 mm',
    maxWidthClass: 'max-w-[1320px]',
  },
  'a1-portrait': {
    id: 'a1-portrait',
    label: 'A1 Portrait',
    dimensions: '594 × 841 mm',
    maxWidthClass: 'max-w-[920px]',
  },
};
