// AI refinement system type definitions

import { LayoutElement } from "../core/element";

export interface RefinementSuggestion {
    description: string;
    apply: () => void;
    previewData: Partial<LayoutElement>;
    energyImprovement: number; // How much this improves the layout energy
}
