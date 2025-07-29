// src/controllers/ElementController.ts
// Controller che gestisce le operazioni sugli elementi specifici

import { DesignModel } from "../models/DesignModel";
import { CanvasView } from "../views/CanvasView";
import { LayoutElement, ElementType } from "../core/element";

export class ElementController {
    private designModel: DesignModel;
    private canvasView: CanvasView;
    private listeners: Map<string, Function[]> = new Map();
    
    // Text editing state
    private editingElement: LayoutElement | null = null;
    private cursorTimer: number | null = null;

    constructor(designModel: DesignModel, canvasView: CanvasView) {
        this.designModel = designModel;
        this.canvasView = canvasView;
        this.initializeEventSystem();
        this.setupKeyboardListeners();
    }

    private initializeEventSystem(): void {
        this.listeners.set('elementCreated', []);
        this.listeners.set('elementUpdated', []);
        this.listeners.set('textEditingStarted', []);
        this.listeners.set('textEditingEnded', []);
    }

    // Event system
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

    private emit(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }

    private setupKeyboardListeners(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        // Handle text editing
        if (this.editingElement) {
            this.handleTextInput(e);
            return;
        }

        // Handle shortcuts when not editing text
        if (!this.isInputFocused()) {
            this.handleShortcuts(e);
        }
    }

    private handleTextInput(e: KeyboardEvent): void {
        if (!this.editingElement) return;

        e.preventDefault();

        if (e.key === "Backspace") {
            this.editingElement.content = this.editingElement.content?.slice(0, -1) || "";
        } else if (e.key === "Enter") {
            this.editingElement.content = (this.editingElement.content || "") + "\n";
            // Re-calculate height for text after adding newline
            this.adjustTextElementHeight(this.editingElement);
        } else if (e.key === "Escape") {
            this.endTextEditing();
            return;
        } else if (e.key.length === 1) { // Avoid special keys like Shift, Alt, Ctrl
            this.editingElement.content = (this.editingElement.content || "") + e.key;
        }

        this.emit('elementUpdated', this.editingElement);
    }

    private handleShortcuts(e: KeyboardEvent): void {
        const selectedElements = this.designModel.getSelectedElements();
        
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedElements.length > 0) {
                this.designModel.removeElements(selectedElements);
            }
        } else if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'd':
                    e.preventDefault();
                    if (selectedElements.length > 0) {
                        this.designModel.duplicateElements(selectedElements);
                    }
                    break;
                case 'a':
                    e.preventDefault();
                    this.designModel.selectAll();
                    break;
            }
        }
    }

    private isInputFocused(): boolean {
        const activeElement = document.activeElement;
        return activeElement instanceof HTMLInputElement || 
               activeElement instanceof HTMLTextAreaElement || 
               activeElement instanceof HTMLSelectElement;
    }

    // Element creation
    public createElement(type: ElementType, x: number, y: number): LayoutElement {
        let element: LayoutElement;

        switch (type) {
            case 'text':
                element = this.createTextElement(x, y);
                break;
            case 'image':
                element = this.createImageElement(x, y);
                break;
            case 'box':
                element = this.createBoxElement(x, y);
                break;
            default:
                throw new Error(`Unknown element type: ${type}`);
        }

        this.emit('elementCreated', element);
        return element;
    }

    private createTextElement(x: number, y: number): LayoutElement {
        const element = new LayoutElement({
            x,
            y,
            width: 200,
            height: 30,
            type: "text",
            content: "New Text",
            fontSize: 20,
            fontColor: "#333333",
            fontFamily: "Arial",
            fontBold: false,
            fontItalic: false,
            textAlign: "left"
        });

        // Start editing immediately
        setTimeout(() => {
            this.startTextEditing(element);
        }, 100);

        return element;
    }

    private createImageElement(x: number, y: number): LayoutElement {
        // Create placeholder image
        const placeholderUrl = this.canvasView.createPlaceholderImage(200, 150, "Image");
        
        return new LayoutElement({
            x,
            y,
            width: 200,
            height: 150,
            type: "image",
            content: placeholderUrl
        });
    }

    private createBoxElement(x: number, y: number): LayoutElement {
        return new LayoutElement({
            x,
            y,
            width: 150,
            height: 100,
            type: "box",
            fillColor: "#007acc"
        });
    }

    // Text editing
    public startTextEditing(element: LayoutElement): void {
        if (element.type !== 'text') return;

        this.endTextEditing(); // End any existing editing session
        
        this.editingElement = element;
        element.isEditing = true;
        element.cursorVisible = true;

        this.cursorTimer = window.setInterval(() => {
            if (this.editingElement) {
                this.editingElement.cursorVisible = !this.editingElement.cursorVisible;
                this.emit('elementUpdated', this.editingElement);
            }
        }, 500);

        this.emit('textEditingStarted', element);
    }

    public endTextEditing(): void {
        if (this.editingElement) {
            this.editingElement.isEditing = false;
            this.editingElement.cursorVisible = false;
            
            const element = this.editingElement;
            this.editingElement = null;
            
            this.emit('textEditingEnded', element);
        }
        
        if (this.cursorTimer !== null) {
            clearInterval(this.cursorTimer);
            this.cursorTimer = null;
        }
    }

    public isEditingText(): boolean {
        return this.editingElement !== null;
    }

    // Element property updates
    public updateElementProperty(element: LayoutElement, property: string, value: any): void {
        const oldValue = (element as any)[property];
        
        if (oldValue === value) return;

        // Validate and convert values as needed
        const validatedValue = this.validatePropertyValue(property, value);
        
        // Apply the update
        (element as any)[property] = validatedValue;
        
        // Handle special cases
        if (property === 'fontSize' && element.type === 'text') {
            this.adjustTextElementHeight(element);
        }
        
        this.emit('elementUpdated', element);
    }

    private validatePropertyValue(property: string, value: any): any {
        switch (property) {
            case 'x':
            case 'y':
                return this.canvasView.snapToGrid(parseFloat(value) || 0);
            
            case 'width':
            case 'height':
                return Math.max(10, parseFloat(value) || 10);
            
            case 'fontSize':
                return Math.max(8, Math.min(200, parseFloat(value) || 20));
            
            case 'fontBold':
            case 'fontItalic':
            case 'locked':
                return Boolean(value);
            
            case 'textAlign':
                return ['left', 'center', 'right'].includes(value) ? value : 'left';
            
            default:
                return value;
        }
    }

    private adjustTextElementHeight(element: LayoutElement): void {
        if (element.type !== 'text' || !element.content) return;

        // Create a temporary canvas to measure text height
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return;

        const height = this.measureTextHeight(element, tempCtx, element.width);
        element.height = Math.max(element.fontSize * 1.2, height);
    }

    private measureTextHeight(element: LayoutElement, ctx: CanvasRenderingContext2D, maxWidth: number): number {
        if (!element.content) return element.fontSize * 1.2;

        ctx.font = `${element.fontItalic ? 'italic ' : ''}${element.fontBold ? 'bold ' : ''}${element.fontSize}px ${element.fontFamily}`;
        const words = element.content.split(/\s+/);
        let line = "";
        let linesCount = 0;
        const lineHeight = element.fontSize * 1.2;

        for (let n = 0; n < words.length; n++) {
            const testLine = line === "" ? words[n] : line + " " + words[n];
            if (ctx.measureText(testLine).width > maxWidth) {
                linesCount++;
                line = words[n];
            } else {
                line = testLine;
            }
        }
        if (line !== "") linesCount++;
        return linesCount * lineHeight;
    }

    // Element transformation
    public moveElement(element: LayoutElement, deltaX: number, deltaY: number): void {
        element.x = this.canvasView.snapToGrid(element.x + deltaX);
        element.y = this.canvasView.snapToGrid(element.y + deltaY);
        this.emit('elementUpdated', element);
    }

    public resizeElement(element: LayoutElement, newWidth: number, newHeight: number): void {
        element.width = Math.max(10, newWidth);
        element.height = Math.max(10, newHeight);
        
        if (element.type === 'text') {
            this.adjustTextElementHeight(element);
        }
        
        this.emit('elementUpdated', element);
    }

    public scaleElement(element: LayoutElement, scaleX: number, scaleY: number): void {
        element.width = Math.max(10, element.width * scaleX);
        element.height = Math.max(10, element.height * scaleY);
        
        if (element.type === 'text') {
            element.fontSize = Math.max(8, element.fontSize * Math.min(scaleX, scaleY));
            this.adjustTextElementHeight(element);
        }
        
        this.emit('elementUpdated', element);
    }

    // Element validation
    public validateElement(element: LayoutElement): boolean {
        // Check basic constraints
        if (element.width <= 0 || element.height <= 0) return false;
        if (element.x < 0 || element.y < 0) return false;
        
        // Type-specific validation
        switch (element.type) {
            case 'text':
                return element.fontSize > 0 && !!element.fontFamily;
            case 'image':
                return !!element.content;
            case 'box':
                return !!element.fillColor;
            default:
                return false;
        }
    }

    // Cleanup
    public destroy(): void {
        this.endTextEditing();
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
}
