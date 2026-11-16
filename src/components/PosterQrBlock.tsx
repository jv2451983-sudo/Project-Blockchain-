import React from 'react';

interface PosterQrBlockProps {
  value: string;
  accentHex: string;
}

export const PosterQrBlock: React.FC<PosterQrBlockProps> = ({ value, accentHex }) => {
  // Deterministic 15x15 geometric matrix derived from the repository URL string
  const size = 15;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderCell = (r: number, c: number) => {
    const inTopLeft = r < 5 && c < 5;
    const inTopRight = r < 5 && c >= size - 5;
    const inBottomLeft = r >= size - 5 && c < 5;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;

    const lr = r >= size - 5 ? r - (size - 5) : r;
    const lc = c >= size - 5 ? c - (size - 5) : c;
    const onBorder = lr === 0 || lr === 4 || lc === 0 || lc === 4;
    const inCenter = lr === 2 && lc === 2;
    return onBorder || inCenter;
  };

  const cells: { r: number; c: number; filled: boolean }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const finder = isFinderCell(r, c);
      if (finder !== null) {
        cells.push({ r, c, filled: finder });
      } else {
        const bit = ((hash >> ((r * 7 + c * 13) % 24)) ^ (r * 3 + c * 5)) & 1;
        cells.push({ r, c, filled: bit === 1 });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-14 h-14 shrink-0 bg-white p-1 border border-stone-200 rounded"
      role="img"
      aria-label={`Reference matrix for ${value}`}
    >
      {cells.map(
        (cell) =>
          cell.filled && (
            <rect
              key={`${cell.r}-${cell.c}`}
              x={cell.c}
              y={cell.r}
              width={0.9}
              height={0.9}
              fill={accentHex}
            />
          )
      )}
    </svg>
  );
};
