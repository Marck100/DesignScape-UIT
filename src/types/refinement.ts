// AI refinement system type definitions for layout suggestions

import { LayoutElement } from "../core/element";

/**
 * Represents a single refinement suggestion from the AI system
 * Contains description, application function, preview data, and energy metrics
 */
export interface RefinementSuggestion {
    description: string;                    // Human-readable description of the suggestion
    apply: () => void;                      // Function to apply this suggestion to the layout
    previewData: Partial<LayoutElement>;   // Preview data showing the proposed changes
    energyImprovement: number;              // Quantified improvement this provides to layout energy
}
