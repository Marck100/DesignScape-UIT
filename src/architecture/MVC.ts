// src/architecture/MVC.ts
// Sistema MVC incrementale che mantiene compatibilità totale con il codice esistente

import { DesignCanvas } from "../core/canvas";
import { LayoutElement, LayoutElementOptions } from "../core/element";

// ============= MODEL LAYER =============

export abstract class BaseModel {
    protected listeners: Map<string, Function[]> = new Map();

    public addEventListener(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public removeEventListener(event: string, callback: Function): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    protected emit(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }
}

// Model che wrappa DesignCanvas esistente mantenendo compatibilità
export class CanvasModel extends BaseModel {
    private canvas: DesignCanvas;

    constructor(canvas: DesignCanvas) {
        super();
        this.canvas = canvas;
        this.setupEventBridge();
    }

    private setupEventBridge(): void {
        // Bridge tra eventi DesignCanvas e sistema MVC
        const originalAddElement = this.canvas.addElement.bind(this.canvas);
        this.canvas.addElement = (element: LayoutElement) => {
            const result = originalAddElement(element);
            this.emit('elementAdded', element);
            this.emit('canvasChanged');
            return result;
        };

        const originalClearCanvas = this.canvas.clearCanvas.bind(this.canvas);
        this.canvas.clearCanvas = () => {
            const result = originalClearCanvas();
            this.emit('canvasCleared');
            this.emit('canvasChanged');
            return result;
        };
    }

    // Proxy methods mantengono compatibilità
    public addElement(element: LayoutElement): void {
        return this.canvas.addElement(element);
    }

    public clearCanvas(): void {
        return this.canvas.clearCanvas();
    }

    public getElements(): LayoutElement[] {
        return this.canvas.getElements();
    }

    public draw(): void {
        return this.canvas.draw();
    }

    public saveState(): void {
        return this.canvas.saveState();
    }

    // Metodi MVC aggiuntivi
    public exportLayout(): LayoutElementOptions[] {
        return this.canvas.getElements().map(el => ({
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
        }));
    }

    public loadLayout(elements: LayoutElementOptions[]): void {
        this.clearCanvas();
        elements.forEach(data => {
            this.addElement(new LayoutElement(data));
        });
        this.draw();
        this.saveState();
    }

    // Expose original canvas for backward compatibility
    public getOriginalCanvas(): DesignCanvas {
        return this.canvas;
    }
}

// ============= VIEW LAYER =============

export abstract class BaseView {
    protected element: HTMLElement;

    constructor(selector: string) {
        const el = document.querySelector(selector);
        if (!el) {
            throw new Error(`Element not found: ${selector}`);
        }
        this.element = el as HTMLElement;
        this.initialize();
    }

    protected abstract initialize(): void;
    public abstract render(data?: any): void;
    public abstract destroy(): void;
}

// View che gestisce la UI mantenendo i manager esistenti
export class CanvasView extends BaseView {
    private model: CanvasModel | null = null;

    constructor() {
        super('#design-canvas');
    }

    protected initialize(): void {
        // La inizializzazione è già gestita dai manager esistenti
        // Questa è solo una shell per futuri miglioramenti MVC
    }

    public bindModel(model: CanvasModel): void {
        this.model = model;
        
        // Listen to model events
        model.addEventListener('canvasChanged', () => {
            this.render();
        });
    }

    public render(data?: any): void {
        if (this.model) {
            // Il rendering è già gestito dal DesignCanvas.draw()
            // Questo metodo è per futuri miglioramenti
        }
    }

    public destroy(): void {
        // Cleanup if needed
    }
}

// ============= CONTROLLER LAYER =============

export abstract class BaseController {
    protected model: BaseModel;
    protected view: BaseView;

    constructor(model: BaseModel, view: BaseView) {
        this.model = model;
        this.view = view;
        this.initialize();
    }

    protected abstract initialize(): void;
    public abstract destroy(): void;
}

// Controller che coordina Model e View mantenendo compatibilità
export class CanvasController extends BaseController {
    private canvasModel: CanvasModel;
    private canvasView: CanvasView;

    constructor(canvasModel: CanvasModel, canvasView: CanvasView) {
        super(canvasModel, canvasView);
        this.canvasModel = canvasModel;
        this.canvasView = canvasView;
    }

    protected initialize(): void {
        // Bind model to view
        this.canvasView.bindModel(this.canvasModel);

        // Setup controller event handling
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // I gestori eventi sono già implementati nei manager esistenti
        // Questo è per futuri miglioramenti MVC
    }

    // Methods that maintain existing functionality while adding MVC structure
    public addElement(elementOptions: LayoutElementOptions): void {
        const element = new LayoutElement(elementOptions);
        this.canvasModel.addElement(element);
    }

    public clearCanvas(): void {
        this.canvasModel.clearCanvas();
    }

    public exportLayout(): LayoutElementOptions[] {
        return this.canvasModel.exportLayout();
    }

    public loadLayout(elements: LayoutElementOptions[]): void {
        this.canvasModel.loadLayout(elements);
    }

    public destroy(): void {
        this.canvasView.destroy();
    }
}

// ============= MVC FACTORY =============

export class MVCFactory {
    public static createCanvasMVC(canvas: DesignCanvas): {
        model: CanvasModel;
        view: CanvasView;
        controller: CanvasController;
    } {
        const model = new CanvasModel(canvas);
        const view = new CanvasView();
        const controller = new CanvasController(model, view);

        return { model, view, controller };
    }
}

// ============= ENHANCED CANVAS WRAPPER =============

// Wrapper che aggiunge funzionalità MVC mantenendo compatibilità totale
export class EnhancedDesignCanvas extends DesignCanvas {
    private mvc: {
        model: CanvasModel;
        view: CanvasView;
        controller: CanvasController;
    };

    constructor(canvas: HTMLCanvasElement) {
        // Initialize with original DesignCanvas functionality
        super(canvas);

        // Add MVC layer on top
        this.mvc = MVCFactory.createCanvasMVC(this);

        console.log('DesignCanvas enhanced with MVC architecture');
    }

    // Enhanced methods that use MVC patterns while maintaining compatibility
    public addElement(element: LayoutElement): void {
        // Call original method (maintains all existing behavior)
        super.addElement(element);
        
        // Add MVC-specific enhancements
        this.validateElementMVC(element);
    }

    private validateElementMVC(element: LayoutElement): void {
        // MVC-style validation with better error handling
        if (element.width <= 0 || element.height <= 0) {
            console.warn('MVC Validation Warning: Element has invalid dimensions', {
                type: element.type,
                dimensions: { width: element.width, height: element.height }
            });
        }

        if (!element.type || !['text', 'image', 'box'].includes(element.type)) {
            console.warn('MVC Validation Warning: Element has invalid type', {
                type: element.type,
                validTypes: ['text', 'image', 'box']
            });
        }
    }

    // Expose MVC components for advanced usage
    public getMVCModel(): CanvasModel {
        return this.mvc.model;
    }

    public getMVCView(): CanvasView {
        return this.mvc.view;
    }

    public getMVCController(): CanvasController {
        return this.mvc.controller;
    }

    // Enhanced export with MVC validation
    public exportLayoutEnhanced(): LayoutElementOptions[] {
        const layout = this.mvc.controller.exportLayout();
        
        // MVC-style validation before export
        const validElements = layout.filter(el => {
            const isValid = el.width > 0 && el.height > 0 && 
                           ['text', 'image', 'box'].includes(el.type);
            if (!isValid) {
                console.warn('MVC Export: Skipping invalid element', el);
            }
            return isValid;
        });

        console.log(`MVC Export: Exported ${validElements.length}/${layout.length} valid elements`);
        return validElements;
    }

    // Enhanced import with MVC validation
    public loadLayoutEnhanced(elements: LayoutElementOptions[]): void {
        // MVC-style validation before import
        const validElements = elements.filter(el => {
            const isValid = el && typeof el.x === 'number' && typeof el.y === 'number' &&
                           el.width > 0 && el.height > 0 && 
                           ['text', 'image', 'box'].includes(el.type);
            if (!isValid) {
                console.warn('MVC Import: Skipping invalid element', el);
            }
            return isValid;
        });

        console.log(`MVC Import: Loading ${validElements.length}/${elements.length} valid elements`);
        this.mvc.controller.loadLayout(validElements);
    }
}
