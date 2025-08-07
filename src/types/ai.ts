// src/types/ai.ts
// Tipi per il sistema di suggerimenti AI

import { LayoutElement } from "../core/element";

export interface RefinementSuggestion {
    description: string;
    apply: () => void;
    previewData: Partial<LayoutElement>;
    energyImprovement: number; // How much this improves the layout energy
}
