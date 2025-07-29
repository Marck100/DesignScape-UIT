// src/architecture/CanvasAdapter.ts
// Adapter che estende DesignCanvas per compatibilità MVC

import { DesignCanvas } from "../core/canvas";
import { LayoutElement } from "../core/element";
import { BaseModel } from "./BaseModel";

export class CanvasAdapter extends BaseModel {
    private canvas: DesignCanvas;
    
    constructor(canvas: DesignCanvas) {
        super();
        this.canvas = canvas;
        this.initializeEvents(['elementAdded', 'elementRemoved', 'elementsCleared', 'canvasUpdated']);
        this.setupCanvasListeners();
    }

    private setupCanvasListeners(): void {
        // Intercetta le operazioni del canvas originale e emette eventi
        const originalAddElement = this.canvas.addElement.bind(this.canvas);
        const originalClearCanvas = this.canvas.clearCanvas.bind(this.canvas);
        const originalDraw = this.canvas.draw.bind(this.canvas);

        // Override addElement
        this.canvas.addElement = (element: LayoutElement) => {
            originalAddElement(element);
            this.emit('elementAdded', element);
            this.emit('canvasUpdated');
        };

        // Override clearCanvas
        this.canvas.clearCanvas = () => {
            originalClearCanvas();
            this.emit('elementsCleared');
            this.emit('canvasUpdated');
        };

        // Override draw
        this.canvas.draw = () => {
            originalDraw();
            this.emit('canvasUpdated');
        };
    }

    // Metodi di accesso al canvas originale
    public getCanvas(): DesignCanvas {
        return this.canvas;
    }

    public getElements(): LayoutElement[] {
        return this.canvas.elements || [];
    }

    public addElement(element: LayoutElement): void {
        this.canvas.addElement(element);
    }

    public clearCanvas(): void {
        this.canvas.clearCanvas();
    }

    public draw(): void {
        this.canvas.draw();
    }

    public saveState(): void {
        if (this.canvas.saveState) {
            this.canvas.saveState();
        }
    }

    public exportLayout(): string {
        return JSON.stringify({
            elements: this.getElements().map(el => ({
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                type: el.type,
                content: el.content,
                fontSize: el.fontSize,
                fontBold: el.fontBold,
                fontItalic: el.fontItalic,
                fontColor: el.fontColor,
                fontFamily: el.fontFamily,
                textAlign: el.textAlign,
                fillColor: el.fillColor
            }))
        });
    }

    // Compatibilità con il codice esistente
    public get currentSelection(): LayoutElement | null {
        const selectedElements = this.getElements().filter(el => el.isSelected);
        return selectedElements.length > 0 ? selectedElements[0] : null;
    }
}
