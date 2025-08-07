// src/patterns/MVCAdapter.ts
// Adapter pattern semplice per aggiungere caratteristiche MVC

import { DesignCanvas } from "../core/canvas";
import { LayoutElement } from "../core/element";

// Interfaccia per l'observer pattern
interface Observer {
    update(event: string, data?: any): void;
}

// Classe Model semplice che wrappa DesignCanvas
export class CanvasModel {
    private canvas: DesignCanvas;
    private observers: Observer[] = [];

    constructor(canvas: DesignCanvas) {
        this.canvas = canvas;
        this.enhanceCanvas();
    }

    private enhanceCanvas(): void {
        // Intercetta le operazioni del canvas per notificare gli observer
        const originalAddElement = this.canvas.addElement.bind(this.canvas);
        this.canvas.addElement = (element: LayoutElement) => {
            const result = originalAddElement(element);
            this.notifyObservers('elementAdded', element);
            return result;
        };

        const originalClearCanvas = this.canvas.clearCanvas.bind(this.canvas);
        this.canvas.clearCanvas = () => {
            const result = originalClearCanvas();
            this.notifyObservers('canvasCleared');
            return result;
        };
    }

    public addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers(event: string, data?: any): void {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].update(event, data);
        }
    }

    // Proxy methods per mantenere compatibilità
    public getElements(): LayoutElement[] {
        return this.canvas.getElements();
    }

    public addElement(element: LayoutElement): void {
        return this.canvas.addElement(element);
    }

    public clearCanvas(): void {
        return this.canvas.clearCanvas();
    }

    public draw(): void {
        return this.canvas.draw();
    }

    public saveState(): void {
        return this.canvas.saveState();
    }

    public getOriginalCanvas(): DesignCanvas {
        return this.canvas;
    }
}

// View semplice per gestire la UI
export class CanvasView implements Observer {
    private element: HTMLCanvasElement;
    private model: CanvasModel | null = null;

    constructor(canvasElement: HTMLCanvasElement) {
        this.element = canvasElement;
    }

    public bindModel(model: CanvasModel): void {
        this.model = model;
        model.addObserver(this);
    }

    public update(event: string, data?: any): void {
        // Gestisci gli eventi del model
        switch (event) {
            case 'elementAdded':
                this.onElementAdded(data);
                break;
            case 'canvasCleared':
                this.onCanvasCleared();
                break;
        }
    }

    private onElementAdded(element: LayoutElement): void {
        console.log('MVC View: Element added', element.type);
    }

    private onCanvasCleared(): void {
        console.log('MVC View: Canvas cleared');
    }
}

// Controller semplice
export class CanvasController {
    private model: CanvasModel;
    private view: CanvasView;

    constructor(model: CanvasModel, view: CanvasView) {
        this.model = model;
        this.view = view;
        this.view.bindModel(model);
    }

    public addElement(elementData: any): void {
        const element = new LayoutElement(elementData);
        this.model.addElement(element);
    }

    public clearCanvas(): void {
        this.model.clearCanvas();
    }

    public exportLayout(): any[] {
        const elements = this.model.getElements();
        const exported = [];
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            exported.push({
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
            });
        }
        return exported;
    }

    public validateElement(element: LayoutElement): boolean {
        const validTypes = ['text', 'image', 'box'];
        let isValidType = false;
        for (let i = 0; i < validTypes.length; i++) {
            if (validTypes[i] === element.type) {
                isValidType = true;
                break;
            }
        }

        const hasValidDimensions = element.width > 0 && element.height > 0;

        if (!isValidType) {
            console.warn('MVC Validation: Invalid element type', element.type);
        }
        if (!hasValidDimensions) {
            console.warn('MVC Validation: Invalid dimensions', element.width, element.height);
        }

        return isValidType && hasValidDimensions;
    }
}

// Factory per creare l'MVC stack
export class MVCFactory {
    public static create(canvas: DesignCanvas, canvasElement: HTMLCanvasElement) {
        const model = new CanvasModel(canvas);
        const view = new CanvasView(canvasElement);
        const controller = new CanvasController(model, view);

        return {
            model,
            view,
            controller
        };
    }
}

// Enhanced DesignCanvas che estende la classe originale
export class EnhancedDesignCanvas extends DesignCanvas {
    private mvc: {
        model: CanvasModel;
        view: CanvasView;
        controller: CanvasController;
    };

    constructor(canvasElement: HTMLCanvasElement) {
        // Inizializza il canvas base
        super(canvasElement);
        
        // Aggiungi il layer MVC sopra
        this.mvc = MVCFactory.create(this, canvasElement);

        console.log('DesignCanvas enhanced with MVC pattern');
    }

    // Override addElement per aggiungere validazione MVC
    public addElement(element: LayoutElement): void {
        // Validazione MVC
        if (!this.mvc.controller.validateElement(element)) {
            console.warn('MVC: Element validation failed, adding anyway for compatibility');
        }

        // Call original method
        super.addElement(element);
    }

    // Override clearCanvas per logging MVC
    public clearCanvas(): void {
        console.log('MVC: Clearing canvas');
        super.clearCanvas();
    }

    // Metodi MVC aggiuntivi
    public getMVCController(): CanvasController {
        return this.mvc.controller;
    }

    public getMVCModel(): CanvasModel {
        return this.mvc.model;
    }

    public getMVCView(): CanvasView {
        return this.mvc.view;
    }

    public exportLayoutMVC(): any[] {
        return this.mvc.controller.exportLayout();
    }

    public validateElementMVC(element: LayoutElement): boolean {
        return this.mvc.controller.validateElement(element);
    }
}
