// Element type definitions and interfaces

export type ElementType = "text" | "image" | "box";
export type TextAlign = "left" | "center" | "right";

export interface LayoutElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;

    type: ElementType;
    content?: string;
    fillColor?: string; 

    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    fontBold?: boolean;
    fontItalic?: boolean;

    textAlign?: TextAlign;
}

// Simplified version for energy calculations and preview
export interface ElementBox {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}
