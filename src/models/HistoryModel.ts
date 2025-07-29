// src/models/HistoryModel.ts
// Model che gestisce la cronologia delle azioni (undo/redo)

import { DesignState } from "./DesignModel";

export class HistoryModel {
    private history: DesignState[] = [];
    private currentIndex: number = -1;
    private maxHistorySize: number = 50;
    
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        this.initializeEventSystem();
    }

    private initializeEventSystem(): void {
        this.listeners.set('historyChanged', []);
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

    // History management
    public saveState(state: DesignState): void {
        // Remove any states after current index (when adding new state after undo)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Deep clone the state
        const clonedState: DesignState = {
            elements: state.elements.map(el => ({
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
                fillColor: el.fillColor,
                isSelected: el.isSelected,
                locked: el.locked
            } as any)),
            selectedElements: [...state.selectedElements],
            zoom: state.zoom,
            gridSize: state.gridSize,
            showGrid: state.showGrid
        };
        
        this.history.push(clonedState);
        this.currentIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.notifyHistoryChange();
    }

    public undo(): DesignState | null {
        if (this.canUndo()) {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            this.notifyHistoryChange();
            return this.cloneState(state);
        }
        return null;
    }

    public redo(): DesignState | null {
        if (this.canRedo()) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            this.notifyHistoryChange();
            return this.cloneState(state);
        }
        return null;
    }

    public canUndo(): boolean {
        return this.currentIndex > 0;
    }

    public canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    public clear(): void {
        this.history = [];
        this.currentIndex = -1;
        this.notifyHistoryChange();
    }

    public getHistoryInfo(): { canUndo: boolean; canRedo: boolean; currentIndex: number; totalStates: number } {
        return {
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            currentIndex: this.currentIndex,
            totalStates: this.history.length
        };
    }

    private notifyHistoryChange(): void {
        this.emit('historyChanged', this.getHistoryInfo());
    }

    private cloneState(state: DesignState): DesignState {
        return {
            elements: state.elements.map(el => ({
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
                fillColor: el.fillColor,
                isSelected: el.isSelected,
                locked: el.locked
            } as any)),
            selectedElements: [...state.selectedElements],
            zoom: state.zoom,
            gridSize: state.gridSize,
            showGrid: state.showGrid
        };
    }
}
