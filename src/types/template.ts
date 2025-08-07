// src/types/template.ts
// Tipi condivisi per i template

import { ElementType, TextAlign } from "./element";

export interface TemplateData {
    elements: TemplateElement[];
    name: string;
    description: string;
}

export interface TemplateElement {
    x: number;
    y: number;
    width: number;
    height: number;
    type: ElementType;
    content: string;
    fontSize?: number;
    fontWeight?: string | number;
    textAlign?: TextAlign;
    color?: string;
    fontStyle?: string;
}
