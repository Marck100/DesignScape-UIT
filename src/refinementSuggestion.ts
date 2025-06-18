// ✅ refinementSuggestions.ts (versione intelligente, fedele al paper DesignScape)
import { LayoutElement } from "./layoutElement";

export interface RefinementSuggestion {
  description: string;
  apply: () => void;
  previewData: Partial<LayoutElement>;
}

function areOverlapping(a: LayoutElement, b: LayoutElement): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function generateRefinementSuggestions(
  selected: LayoutElement,
  allElements: LayoutElement[],
  canvasWidth: number,
  canvasHeight: number,
  redraw: () => void
): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];
  const others = allElements.filter(e => e !== selected);

  // 1. Centra orizzontalmente
  suggestions.push({
    description: "Centra orizzontalmente nel canvas",
    previewData: { x: (canvasWidth - selected.width) / 2 },
    apply: () => {
      selected.x = (canvasWidth - selected.width) / 2;
      redraw();
    },
  });

  // 2. Centra verticalmente
  suggestions.push({
    description: "Centra verticalmente nel canvas",
    previewData: { y: (canvasHeight - selected.height) / 2 },
    apply: () => {
      selected.y = (canvasHeight - selected.height) / 2;
      redraw();
    },
  });

  // 3. Allinea con bordo sinistro del primo elemento simile
  const alignTarget = others.find(e => Math.abs(e.x - selected.x) > 5);
  if (alignTarget) {
    suggestions.push({
      description: "Allinea a sinistra con elemento vicino",
      previewData: { x: alignTarget.x },
      apply: () => {
        selected.x = alignTarget.x;
        redraw();
      },
    });
  }

  // 4. Evita sovrapposizione se presente
  const overlapTarget = others.find(e => areOverlapping(e, selected));
  if (overlapTarget) {
    const safeY = overlapTarget.y + overlapTarget.height + 10;
    suggestions.push({
      description: "Evita sovrapposizione con elemento vicino",
      previewData: { y: safeY },
      apply: () => {
        selected.y = safeY;
        redraw();
      },
    });
  }

  // 5. Uniforma larghezza se differente
  const maxWidth = Math.max(...others.map(e => e.width));
  if (Math.abs(selected.width - maxWidth) > 10) {
    suggestions.push({
      description: "Uniforma larghezza con altri elementi",
      previewData: { width: maxWidth },
      apply: () => {
        selected.width = maxWidth;
        redraw();
      },
    });
  }

  return suggestions;
}
