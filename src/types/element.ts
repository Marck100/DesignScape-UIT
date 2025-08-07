// src/types/element.ts
// Tipi per gli elementi del layout

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

// Versione semplificata per calcoli di energia e preview
export interface ElementBox {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}
