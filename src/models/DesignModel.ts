// src/models/DesignModel.ts
// Model che gestisce i dati del design e la logica di business

import { LayoutElement, LayoutElementOptions } from "../core/element";

export interface DesignState {
    elements: LayoutElement[];
    selectedElements: LayoutElement[];
    zoom: number;
    gridSize: number;
    showGrid: boolean;
}

export class DesignModel {
    private elements: LayoutElement[] = [];
    private selectedElements: LayoutElement[] = [];
    private zoom: number = 1;
    private gridSize: number = 20;
    private showGrid: boolean = true;
    
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        this.initializeEventSystem();
    }

    private initializeEventSystem(): void {
        this.listeners.set('elementsChanged', []);
        this.listeners.set('selectionChanged', []);
        this.listeners.set('stateChanged', []);
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

    // Element management
    public addElement(element: LayoutElement): void {
        this.elements.push(element);
        this.emit('elementsChanged', { action: 'add', element });
        this.emit('stateChanged');
    }

    public removeElements(elements: LayoutElement[]): void {
        elements.forEach(element => {
            const index = this.elements.indexOf(element);
            if (index > -1) {
                this.elements.splice(index, 1);
            }
        });
        this.clearSelection();
        this.emit('elementsChanged', { action: 'remove', elements });
        this.emit('stateChanged');
    }

    public clearElements(): void {
        this.elements = [];
        this.clearSelection();
        this.emit('elementsChanged', { action: 'clear' });
        this.emit('stateChanged');
    }

    public duplicateElements(elements: LayoutElement[]): LayoutElement[] {
        const duplicates: LayoutElement[] = [];
        elements.forEach(element => {
            const duplicate = new LayoutElement({
                x: element.x + 20,
                y: element.y + 20,
                width: element.width,
                height: element.height,
                type: element.type,
                content: element.content,
                fontSize: element.fontSize,
                fontBold: element.fontBold,
                fontItalic: element.fontItalic,
                fontColor: element.fontColor,
                fontFamily: element.fontFamily,
                textAlign: element.textAlign,
                fillColor: element.fillColor
            });
            this.elements.push(duplicate);
            duplicates.push(duplicate);
        });
        
        this.emit('elementsChanged', { action: 'duplicate', elements: duplicates });
        this.emit('stateChanged');
        return duplicates;
    }

    // Selection management
    public selectElement(element: LayoutElement): void {
        this.clearSelection();
        this.selectedElements = [element];
        element.isSelected = true;
        this.emit('selectionChanged', this.selectedElements);
    }

    public selectElements(elements: LayoutElement[]): void {
        this.clearSelection();
        this.selectedElements = [...elements];
        elements.forEach(el => el.isSelected = true);
        this.emit('selectionChanged', this.selectedElements);
    }

    public toggleElementSelection(element: LayoutElement): void {
        if (this.selectedElements.includes(element)) {
            this.deselectElement(element);
        } else {
            this.selectedElements.push(element);
            element.isSelected = true;
            this.emit('selectionChanged', this.selectedElements);
        }
    }

    public deselectElement(element: LayoutElement): void {
        const index = this.selectedElements.indexOf(element);
        if (index > -1) {
            this.selectedElements.splice(index, 1);
            element.isSelected = false;
            this.emit('selectionChanged', this.selectedElements);
        }
    }

    public clearSelection(): void {
        this.selectedElements.forEach(el => el.isSelected = false);
        this.selectedElements = [];
        this.emit('selectionChanged', this.selectedElements);
    }

    public selectAll(): void {
        this.selectedElements = [...this.elements];
        this.elements.forEach(el => el.isSelected = true);
        this.emit('selectionChanged', this.selectedElements);
    }

    // Getters
    public getElements(): LayoutElement[] {
        return [...this.elements];
    }

    public getSelectedElements(): LayoutElement[] {
        return [...this.selectedElements];
    }



    public getElementAt(x: number, y: number): LayoutElement | null {
        // Search from top to bottom (last drawn element first)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            if (this.elements[i].contains(x, y)) {
                return this.elements[i];
            }
        }
        return null;
    }

    public getElementsInArea(x1: number, y1: number, x2: number, y2: number): LayoutElement[] {
        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);
        const top = Math.min(y1, y2);
        const bottom = Math.max(y1, y2);

        return this.elements.filter(element => {
            return element.x < right && 
                   element.x + element.width > left &&
                   element.y < bottom && 
                   element.y + element.height > top;
        });
    }

    // State management
    public getState(): DesignState {
        return {
            elements: this.elements.map(el => new LayoutElement({
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
            })),
            selectedElements: [...this.selectedElements],
            zoom: this.zoom,
            gridSize: this.gridSize,
            showGrid: this.showGrid
        };
    }

    public setState(state: DesignState): void {
        this.elements = state.elements;
        this.selectedElements = state.selectedElements;
        this.zoom = state.zoom;
        this.gridSize = state.gridSize;
        this.showGrid = state.showGrid;
        
        // Update selection state on elements
        this.elements.forEach(el => el.isSelected = false);
        this.selectedElements.forEach(el => el.isSelected = true);
        
        this.emit('elementsChanged', { action: 'setState' });
        this.emit('selectionChanged', this.selectedElements);
        this.emit('stateChanged');
    }

    public loadElements(elements: LayoutElementOptions[]): void {
        this.elements = elements.map(data => new LayoutElement(data));
        this.clearSelection();
        this.emit('elementsChanged', { action: 'load' });
        this.emit('stateChanged');
    }

    // Canvas properties
    public setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(5, zoom));
        this.emit('stateChanged');
    }

    public getZoom(): number {
        return this.zoom;
    }

    public setGridSize(size: number): void {
        this.gridSize = Math.max(5, Math.min(100, size));
        this.emit('stateChanged');
    }

    public getGridSize(): number {
        return this.gridSize;
    }

    public setShowGrid(show: boolean): void {
        this.showGrid = show;
        this.emit('stateChanged');
    }

    public getShowGrid(): boolean {
        return this.showGrid;
    }

    // Export/Import
    public exportToJSON(): string {
        return JSON.stringify({
            elements: this.elements.map(el => ({
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
            })),
            zoom: this.zoom,
            gridSize: this.gridSize,
            showGrid: this.showGrid
        });
    }

    public importFromJSON(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            if (data.elements) {
                this.loadElements(data.elements);
            }
            if (data.zoom !== undefined) this.setZoom(data.zoom);
            if (data.gridSize !== undefined) this.setGridSize(data.gridSize);
            if (data.showGrid !== undefined) this.setShowGrid(data.showGrid);
        } catch (error) {
            throw new Error('Invalid JSON data for import');
        }
    }
}
