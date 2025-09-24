// Element type definitions and interfaces for layout components

// Core element types supported by the design system
export type ElementType = "text" | "image" | "box";

// Text alignment options for text elements
export type TextAlign = "left" | "center" | "right";

/**
 * Configuration options for creating layout elements
 * Includes position, dimensions, type, and styling properties
 */
export interface LayoutElementOptions {
    // Position and dimensions (required)
    x: number;
    y: number;
    width: number;
    height: number;

    // Element type and basic properties
    type: ElementType;
    content?: string;        // Text content or image URL
    fillColor?: string;      // Background/fill color

    // Typography properties (for text elements)
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    fontBold?: boolean;
    fontItalic?: boolean;
    textAlign?: TextAlign;
}

/**
 * Simplified element representation for energy calculations and layout analysis
 * Contains only the essential geometric properties
 */
export interface ElementBox {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}
