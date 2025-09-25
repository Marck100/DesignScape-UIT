// Template data structures and types for predefined layouts

import { ElementType, TextAlign } from "./element";

/**
 * Represents a complete template with elements and metadata
 * Used for providing predefined layout starting points
 */
export interface TemplateData {
    elements: TemplateElement[];    // Array of elements in this template
    name: string;                   // Display name for the template
    description: string;            // Description shown to users
}

/**
 * Individual element within a template
 * Contains all necessary properties for element creation
 */
export interface TemplateElement {
    // Position and dimensions
    x: number;
    y: number;
    width: number;
    height: number;
    
    // Element properties
    type: ElementType;
    content: string;
    
    // Optional styling properties (modern format)
    fontSize?: number;
    fontBold?: boolean;
    fontItalic?: boolean;
    textAlign?: TextAlign;
    fontColor?: string;
    fillColor?: string;
}
