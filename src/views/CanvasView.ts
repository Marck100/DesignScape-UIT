// src/views/CanvasView.ts
// View che gestisce il rendering del canvas e l'interfaccia di disegno

import { LayoutElement } from "../core/element";
import { DesignState } from "../models/DesignModel";

export interface CanvasViewOptions {
    canvas: HTMLCanvasElement;
    showGrid?: boolean;
    gridSize?: number;
    zoom?: number;
}

export class CanvasView {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private showGrid: boolean = true;
    private gridSize: number = 20;
    private zoom: number = 1;
    
    private listeners: Map<string, Function[]> = new Map();

    constructor(options: CanvasViewOptions) {
        this.canvas = options.canvas;
        const context = this.canvas.getContext("2d");
        
        if (!context) {
            throw new Error("Cannot get canvas context");
        }
        
        this.ctx = context;
        this.showGrid = options.showGrid ?? true;
        this.gridSize = options.gridSize ?? 20;
        this.zoom = options.zoom ?? 1;
        
        this.initializeEventSystem();
        this.setupCanvasEventListeners();
    }

    private initializeEventSystem(): void {
        this.listeners.set('mousedown', []);
        this.listeners.set('mousemove', []);
        this.listeners.set('mouseup', []);
        this.listeners.set('doubleclick', []);
        this.listeners.set('imageloaded', []);
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

    private setupCanvasEventListeners(): void {
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("dblclick", this.onDoubleClick.bind(this));
        
        // Listener per il caricamento delle immagini
        this.canvas.addEventListener("imageLoaded", ((e: CustomEvent) => {
            this.onImageLoaded(e);
        }) as EventListener);
    }

    private onMouseDown(e: MouseEvent): void {
        const position = this.getMousePosition(e);
        this.emit('mousedown', { position, originalEvent: e });
    }

    private onMouseMove(e: MouseEvent): void {
        const position = this.getMousePosition(e);
        this.emit('mousemove', { position, originalEvent: e });
    }

    private onMouseUp(e: MouseEvent): void {
        const position = this.getMousePosition(e);
        this.emit('mouseup', { position, originalEvent: e });
    }

    private onDoubleClick(e: MouseEvent): void {
        const position = this.getMousePosition(e);
        this.emit('doubleclick', { position, originalEvent: e });
    }

    private onImageLoaded(e: CustomEvent): void {
        this.emit('imageloaded', e.detail);
    }

    private getMousePosition(e: MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX / this.zoom,
            y: (e.clientY - rect.top) * scaleY / this.zoom
        };
    }

    // Rendering methods
    public render(elements: LayoutElement[], selectedElements: LayoutElement[] = []): void {
        this.clearCanvas();
        
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Ordina elementi per z-index implicito
        const sortedElements = [...elements].sort((a, b) => {
            // Immagini sotto, testo sopra per layering naturale
            const orderMap = { 'box': 0, 'image': 1, 'text': 2 };
            return orderMap[a.type] - orderMap[b.type];
        });
        
        // Rendering batch degli elementi
        sortedElements.forEach(element => {
            const isSelected = selectedElements.includes(element);
            this.drawElement(element, isSelected);
            
            if (isSelected) {
                this.drawResizeHandles(element);
            }
        });
        
        this.ctx.restore();
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawGrid(): void {
        const { width, height } = this.canvas;
        const gridSize = this.gridSize;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.5;
        
        // Linee verticali
        for (let x = 0; x <= width / this.zoom; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height / this.zoom);
            this.ctx.stroke();
        }
        
        // Linee orizzontali
        for (let y = 0; y <= height / this.zoom; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width / this.zoom, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    private drawElement(element: LayoutElement, isSelected: boolean): void {
        // Usa il metodo draw dell'elemento, ma senza la logica di selezione
        const originalIsSelected = element.isSelected;
        element.isSelected = isSelected;
        element.draw(this.ctx);
        element.isSelected = originalIsSelected;
    }

    private drawResizeHandles(element: LayoutElement): void {
        const handles = element.getResizeHandles();
        
        this.ctx.save();
        this.ctx.fillStyle = "#667eea";
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2;
        
        for (const handle of handles) {
            // Handle principale
            this.ctx.fillRect(
                handle.x - element.resizeHandleSize / 2,
                handle.y - element.resizeHandleSize / 2,
                element.resizeHandleSize,
                element.resizeHandleSize
            );
            
            // Bordo bianco per contrasto
            this.ctx.strokeRect(
                handle.x - element.resizeHandleSize / 2,
                handle.y - element.resizeHandleSize / 2,
                element.resizeHandleSize,
                element.resizeHandleSize
            );
        }
        
        this.ctx.restore();
    }

    public drawSelectionBox(startX: number, startY: number, endX: number, endY: number): void {
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        
        // Selection box background
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        this.ctx.fillRect(x, y, width, height);
        
        // Selection box border
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.setLineDash([]);
        
        this.ctx.restore();
    }

    // Canvas property setters
    public setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(5, zoom));
    }

    public getZoom(): number {
        return this.zoom;
    }

    public setGridSize(size: number): void {
        this.gridSize = Math.max(5, Math.min(100, size));
    }

    public getGridSize(): number {
        return this.gridSize;
    }

    public setShowGrid(show: boolean): void {
        this.showGrid = show;
    }

    public getShowGrid(): boolean {
        return this.showGrid;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    // Utility methods
    public snapToGrid(value: number, customGridSize?: number): number {
        const gridSize = customGridSize || this.gridSize;
        return Math.round(value / gridSize) * gridSize;
    }

    public screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (screenX - rect.left) * scaleX / this.zoom,
            y: (screenY - rect.top) * scaleY / this.zoom
        };
    }

    public canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;

        return {
            x: (canvasX * this.zoom * scaleX) + rect.left,
            y: (canvasY * this.zoom * scaleY) + rect.top
        };
    }

    // Image handling
    public createPlaceholderImage(width: number, height: number, text: string): string {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d')!;
        
        // Background grigio chiaro
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Bordo
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width-2, height-2);
        
        // Testo centrato
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width/2, height/2);
        
        return tempCanvas.toDataURL();
    }

    // Cursor management
    public setCursor(cursor: string): void {
        document.body.style.cursor = cursor;
    }

    public resetCursor(): void {
        document.body.style.cursor = 'default';
    }

    // State update
    public updateFromState(state: DesignState): void {
        this.setZoom(state.zoom);
        this.setGridSize(state.gridSize);
        this.setShowGrid(state.showGrid);
    }
}
