import { LayoutElement } from "./element";
import { RefinementSuggestion } from "../types/refinement";
import { ElementBox } from "../types/element";

// TODO: Parameter tuning
const DEFAULT_ALIGNMENT_SCORE = 10;
const CENTERED_ALIGNMENT_SCORE = 15;
const OVERLAP_PENALTY = 0.1;
const SYMMETRY_PENALTY = 0.01;

// Alignment
function calculateAlignmentEnergy(elements: ElementBox[]): number {
  let energy = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      
      // Get difference in allignment
      const leftAlign = Math.abs(a.x - b.x);
      const rightAlign = Math.abs((a.x + a.width) - (b.x + b.width));
      const topAlign = Math.abs(a.y - b.y);
      const bottomAlign = Math.abs((a.y + a.height) - (b.y + b.height));
      const centerAlignH = Math.abs((a.x + a.width/2) - (b.x + b.width/2));
      const centerAlignV = Math.abs((a.y + a.height/2) - (b.y + b.height/2));
      
      // Add energy for good alignments (lower is better)
      const alignmentThreshold = 5;
      if (leftAlign < alignmentThreshold) energy -= DEFAULT_ALIGNMENT_SCORE;
      if (rightAlign < alignmentThreshold) energy -= DEFAULT_ALIGNMENT_SCORE;
      if (topAlign < alignmentThreshold) energy -= DEFAULT_ALIGNMENT_SCORE;
      if (bottomAlign < alignmentThreshold) energy -= DEFAULT_ALIGNMENT_SCORE;
      if (centerAlignH < alignmentThreshold) energy -= CENTERED_ALIGNMENT_SCORE;
      if (centerAlignV < alignmentThreshold) energy -= CENTERED_ALIGNMENT_SCORE;
    }
  }
  return energy;
}

// Overlap
function calculateOverlapEnergy(elements: ElementBox[]): number {
  let energy = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      
      // Calculate overlap area
      const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
      const overlapArea = overlapX * overlapY;
      
      // Heavy penalty for overlaps
      energy += overlapArea * OVERLAP_PENALTY;
    }
  }
  return energy;
}

// Symmetry
function calculateSymmetryEnergy(elements: ElementBox[], canvasWidth: number, canvasHeight: number): number {
  let energy = 0;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Calculate balance around center
  let leftWeight = 0
  let rightWeight = 0
  let topWeight = 0
  let bottomWeight = 0;
  
  elements.forEach(el => {
    const elementCenterX = el.x + el.width / 2;
    const elementCenterY = el.y + el.height / 2;
    const weight = el.width * el.height; 
    
    if (elementCenterX < centerX) {
      leftWeight += weight;
    } else {
      rightWeight += weight;
    }
    
    if (elementCenterY < centerY) {
      topWeight += weight;
    } else {
      bottomWeight += weight;
    }
  });
  
  // Penalty for imbalance
  const horizontalImbalance = Math.abs(leftWeight - rightWeight);
  const verticalImbalance = Math.abs(topWeight - bottomWeight);
  
  energy += (horizontalImbalance + verticalImbalance) * SYMMETRY_PENALTY;
  
  return energy;
}

function calculateLayoutEnergy(elements: ElementBox[], canvasWidth: number, canvasHeight: number): number {
  const alignmentEnergy = calculateAlignmentEnergy(elements);
  const overlapEnergy = calculateOverlapEnergy(elements);
  const symmetryEnergy = calculateSymmetryEnergy(elements, canvasWidth, canvasHeight);

  return alignmentEnergy + overlapEnergy + symmetryEnergy;
}

// Convert LayoutElement to ElementBox for energy calculations
function toElementBox(el: LayoutElement): ElementBox {
  return {
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    type: el.type
  };
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
  
  // Convert to ElementBox for energy calculations
  const currentBoxes = allElements.map(toElementBox);
  const currentEnergy = calculateLayoutEnergy(currentBoxes, canvasWidth, canvasHeight);

  // Helper function to test a modification and calculate energy improvement
  function testModification(
    description: string,
    modification: Partial<LayoutElement>
  ): RefinementSuggestion | null {
    // Create modified element box
    const modifiedSelected = { ...toElementBox(selected), ...modification };
    const modifiedBoxes = [
      ...others.map(toElementBox),
      modifiedSelected
    ];
    
    const newEnergy = calculateLayoutEnergy(modifiedBoxes, canvasWidth, canvasHeight);
    const improvement = currentEnergy - newEnergy;
    
    // Only suggest if it actually improves the layout
    if (improvement > 0.5) {
      return {
        description,
        previewData: modification,
        energyImprovement: improvement,
        apply: () => {
          Object.assign(selected, modification);
          redraw();
        },
      };
    }
    return null;
  }

  // 1. Alignment suggestions - align with other elements
  others.forEach(other => {
    // Left align
    const leftAlign = testModification(
      `Align left edge with "${other.type}" element`,
      { x: other.x }
    );
    if (leftAlign) suggestions.push(leftAlign);

    // Right align
    const rightAlign = testModification(
      `Align right edge with "${other.type}" element`,
      { x: other.x + other.width - selected.width }
    );
    if (rightAlign) suggestions.push(rightAlign);

    // Center align horizontally
    const centerHAlign = testModification(
      `Center align horizontally with "${other.type}" element`,
      { x: other.x + (other.width - selected.width) / 2 }
    );
    if (centerHAlign) suggestions.push(centerHAlign);

    // Top align
    const topAlign = testModification(
      `Align top edge with "${other.type}" element`,
      { y: other.y }
    );
    if (topAlign) suggestions.push(topAlign);

    // Bottom align
    const bottomAlign = testModification(
      `Align bottom edge with "${other.type}" element`,
      { y: other.y + other.height - selected.height }
    );
    if (bottomAlign) suggestions.push(bottomAlign);

    // Center align vertically
    const centerVAlign = testModification(
      `Center align vertically with "${other.type}" element`,
      { y: other.y + (other.height - selected.height) / 2 }
    );
    if (centerVAlign) suggestions.push(centerVAlign);
  });

  // 2. Overlap resolution - move element to avoid overlaps
  others.forEach(other => {
    const overlap = !(selected.x + selected.width <= other.x || 
                     other.x + other.width <= selected.x || 
                     selected.y + selected.height <= other.y || 
                     other.y + other.height <= selected.y);
    
    if (overlap) {
      // Try moving to different positions to resolve overlap
      const positions = [
        { x: other.x + other.width + 10, y: selected.y }, // Right
        { x: other.x - selected.width - 10, y: selected.y }, // Left
        { x: selected.x, y: other.y + other.height + 10 }, // Below
        { x: selected.x, y: other.y - selected.height - 10 }, // Above
      ].filter(pos => pos.x >= 0 && pos.y >= 0 && 
                     pos.x + selected.width <= canvasWidth && 
                     pos.y + selected.height <= canvasHeight);

      positions.forEach(pos => {
        const overlapFix = testModification(
          `Move to avoid overlap with "${other.type}" element`,
          pos
        );
        if (overlapFix) suggestions.push(overlapFix);
      });
    }
  });

  // 3. Canvas-based suggestions
  const canvasCenter = testModification(
    "Center in canvas",
    { 
      x: (canvasWidth - selected.width) / 2,
      y: (canvasHeight - selected.height) / 2 
    }
  );
  if (canvasCenter) suggestions.push(canvasCenter);

  const centerHorizontally = testModification(
    "Center horizontally in canvas",
    { x: (canvasWidth - selected.width) / 2 }
  );
  if (centerHorizontally) suggestions.push(centerHorizontally);

  const centerVertically = testModification(
    "Center vertically in canvas",
    { y: (canvasHeight - selected.height) / 2 }
  );
  if (centerVertically) suggestions.push(centerVertically);

  // Sort by energy improvement (best first) and limit to top suggestions
  suggestions.sort((a, b) => b.energyImprovement - a.energyImprovement);
  
  return suggestions.slice(0, 6); // Return top 6 suggestions
}
