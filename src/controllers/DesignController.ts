// src/controllers/DesignController.ts
// Controller principale che coordina Model e View per l'editor di design

import { DesignModel } from "../models/DesignModel";
import { HistoryModel } from "../models/HistoryModel";
import { TemplateModel } from "../models/TemplateModel";
import { CanvasView } from "../views/CanvasView";
import { UIView } from "../views/UIView";
import { LayoutElement, LayoutElementOptions } from "../core/element";
import { ElementController } from "./ElementController";
import { TemplateController } from "./TemplateController";

export interface DesignControllerOptions {
    canvas: HTMLCanvasElement;
}

export class DesignController {
    // Models
    private designModel: DesignModel;
    private historyModel: HistoryModel;
    private templateModel: TemplateModel;
    
    // Views
    private canvasView: CanvasView;
    private uiView: UIView;
    
    // Sub-controllers
    private elementController: ElementController;
    private templateController: TemplateController;
    
    // State
    private currentTool: string = 'select';
    private currentMode: 'select' | 'move' | 'resize' | 'create' = 'select';
    private interactionState: {
        isDragging: boolean;
        isResizing: boolean;
        isSelecting: boolean;
        dragStart: { x: number; y: number } | null;
        resizeHandle: string | null;
        selectionStart: { x: number; y: number } | null;
        originalBounds: any[] | null;
    } = {
        isDragging: false,
        isResizing: false,
        isSelecting: false,
        dragStart: null,
        resizeHandle: null,
        selectionStart: null,
        originalBounds: null
    };

    constructor(options: DesignControllerOptions) {
        // Initialize models
        this.designModel = new DesignModel();
        this.historyModel = new HistoryModel();
        this.templateModel = new TemplateModel();
        
        // Initialize views
        this.canvasView = new CanvasView({
            canvas: options.canvas,
            showGrid: true,
            gridSize: 20,
            zoom: 1
        });
        this.uiView = new UIView();
        
        // Initialize sub-controllers
        this.elementController = new ElementController(this.designModel, this.canvasView);
        this.templateController = new TemplateController(this.templateModel, this.designModel);
        
        this.setupEventListeners();
        this.initializeApplication();
    }

    private setupEventListeners(): void {
        this.setupModelEventListeners();
        this.setupViewEventListeners();
        this.setupSubControllerEventListeners();
    }

    private setupModelEventListeners(): void {
        // Design model events
        this.designModel.addEventListener('elementsChanged', () => {
            this.render();
            this.saveStateToHistory();
        });
        
        this.designModel.addEventListener('selectionChanged', (selectedElements: LayoutElement[]) => {
            this.uiView.updateControlsFromElement(selectedElements[0] || null);
            this.render();
        });
        
        this.designModel.addEventListener('stateChanged', () => {
            this.render();
        });

        // History model events
        this.historyModel.addEventListener('historyChanged', (info: any) => {
            this.uiView.updateHistoryControls(info.canUndo, info.canRedo);
        });
    }

    private setupViewEventListeners(): void {
        // Canvas view events
        this.canvasView.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
        this.canvasView.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        this.canvasView.addEventListener('mouseup', this.handleCanvasMouseUp.bind(this));
        this.canvasView.addEventListener('doubleclick', this.handleCanvasDoubleClick.bind(this));
        
        // UI view events
        this.uiView.addEventListener('toolSelected', (data: any) => {
            this.setCurrentTool(data.tool);
        });
        
        this.uiView.addEventListener('controlChanged', this.handleControlChange.bind(this));
        this.uiView.addEventListener('actionTriggered', this.handleActionTrigger.bind(this));
        this.uiView.addEventListener('zoomChanged', this.handleZoomChange.bind(this));
        this.uiView.addEventListener('gridToggled', this.handleGridToggle.bind(this));
        this.uiView.addEventListener('lockToggled', this.handleLockToggle.bind(this));
    }

    private setupSubControllerEventListeners(): void {
        // Element controller events
        this.elementController.addEventListener('elementCreated', (element: LayoutElement) => {
            this.designModel.addElement(element);
        });
        
        this.elementController.addEventListener('elementUpdated', () => {
            this.render();
        });
    }

    private initializeApplication(): void {
        // Load initial template or layout
        this.loadInitialContent();
        
        // Save initial state
        this.saveStateToHistory();
        
        // Initial render
        this.render();
        
        // Initialize UI state
        this.uiView.updateHistoryControls(false, false);
        this.uiView.updateZoomDisplay(1);
        this.uiView.updateGridDisplay(true);
    }

    private loadInitialContent(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const isImport = urlParams.get('import') === 'true';
        const templateName = urlParams.get('template');

        if (isImport) {
            this.handleImportedData();
        } else if (templateName) {
            this.handleTemplateLoad(templateName);
        } else {
            this.loadDefaultLayout();
        }
    }

    private handleImportedData(): void {
        const importedData = sessionStorage.getItem('importedLayout');
        if (importedData) {
            try {
                const data = JSON.parse(importedData);
                this.designModel.loadElements(data.elements);
                sessionStorage.removeItem('importedLayout');
            } catch (error) {
                console.error('Error loading imported data:', error);
                this.loadDefaultLayout();
            }
        }
    }

    private handleTemplateLoad(templateName: string): void {
        const templateData = sessionStorage.getItem('templateData');
        if (templateData) {
            try {
                const data = JSON.parse(templateData);
                const enhancedElements = this.templateModel.enhanceTemplateElements(data.elements, templateName);
                this.designModel.loadElements(enhancedElements);
                sessionStorage.removeItem('templateData');
            } catch (error) {
                console.error('Error loading template data:', error);
                this.loadDefaultLayout();
            }
        } else if (templateName !== 'blank') {
            this.loadDefaultLayout();
        }
    }

    private loadDefaultLayout(): void {
        const defaultElements = this.templateModel.createDefaultLayout();
        this.designModel.loadElements(defaultElements);
    }

    // Canvas interaction handlers
    private handleCanvasMouseDown(data: any): void {
        const { position, originalEvent } = data;
        const { x, y } = position;

        if (this.currentTool !== 'select') {
            this.handleElementCreation(x, y);
            return;
        }

        const clickedElement = this.designModel.getElementAt(x, y);
        
        if (clickedElement) {
            this.handleElementInteraction(clickedElement, x, y, originalEvent);
        } else {
            this.handleEmptyAreaClick(x, y);
        }
    }

    private handleElementCreation(x: number, y: number): void {
        const snappedX = this.canvasView.snapToGrid(x);
        const snappedY = this.canvasView.snapToGrid(y);
        
        this.elementController.createElement(this.currentTool as any, snappedX, snappedY);
    }

    private handleElementInteraction(element: LayoutElement, x: number, y: number, event: MouseEvent): void {
        // Handle selection
        if (event.ctrlKey || event.metaKey) {
            this.designModel.toggleElementSelection(element);
        } else if (!this.designModel.getSelectedElements().includes(element)) {
            this.designModel.selectElement(element);
        }

        // Check for resize handle
        const resizeHandle = this.getResizeHandle(element, x, y);
        if (resizeHandle) {
            this.startResize(resizeHandle, x, y);
        } else {
            this.startDrag(x, y);
        }
    }

    private handleEmptyAreaClick(x: number, y: number): void {
        this.designModel.clearSelection();
        this.startSelection(x, y);
    }

    private handleCanvasMouseMove(data: any): void {
        const { position } = data;
        const { x, y } = position;

        if (this.interactionState.isDragging) {
            this.handleDrag(x, y);
        } else if (this.interactionState.isResizing) {
            this.handleResize(x, y);
        } else if (this.interactionState.isSelecting) {
            this.handleSelection(x, y);
        } else {
            this.updateCursor(x, y);
        }
    }

    private handleCanvasMouseUp(data: any): void {
        this.endInteraction();
    }

    private handleCanvasDoubleClick(data: any): void {
        const { position } = data;
        const { x, y } = position;
        
        const element = this.designModel.getElementAt(x, y);
        if (element && element.type === 'text') {
            this.elementController.startTextEditing(element);
        }
    }

    // Interaction state management
    private startDrag(x: number, y: number): void {
        this.interactionState.isDragging = true;
        this.interactionState.dragStart = { x, y };
        this.currentMode = 'move';
        this.canvasView.setCursor('move');
    }

    private startResize(handle: string, x: number, y: number): void {
        this.interactionState.isResizing = true;
        this.interactionState.resizeHandle = handle;
        this.interactionState.dragStart = { x, y };
        
        // Store original bounds for all selected elements
        this.interactionState.originalBounds = this.designModel.getSelectedElements().map(el => ({
            x: el.x, y: el.y, width: el.width, height: el.height
        }));
        
        this.currentMode = 'resize';
        this.updateResizeCursor(handle);
    }

    private startSelection(x: number, y: number): void {
        this.interactionState.isSelecting = true;
        this.interactionState.selectionStart = { x, y };
        this.currentMode = 'select';
    }

    private handleDrag(x: number, y: number): void {
        if (!this.interactionState.dragStart) return;
        
        const deltaX = x - this.interactionState.dragStart.x;
        const deltaY = y - this.interactionState.dragStart.y;
        
        const selectedElements = this.designModel.getSelectedElements();
        selectedElements.forEach(element => {
            element.x = this.canvasView.snapToGrid(element.x + deltaX);
            element.y = this.canvasView.snapToGrid(element.y + deltaY);
        });
        
        this.interactionState.dragStart = { x, y };
        this.render();
    }

    private handleResize(x: number, y: number): void {
        if (!this.interactionState.dragStart || !this.interactionState.resizeHandle || !this.interactionState.originalBounds) return;
        
        const deltaX = x - this.interactionState.dragStart.x;
        const deltaY = y - this.interactionState.dragStart.y;
        
        const selectedElements = this.designModel.getSelectedElements();
        selectedElements.forEach((element, index) => {
            const original = this.interactionState.originalBounds![index];
            if (!original) return;
            
            this.applyResize(element, original, this.interactionState.resizeHandle!, deltaX, deltaY);
        });
        
        this.render();
    }

    private handleSelection(x: number, y: number): void {
        if (!this.interactionState.selectionStart) return;
        
        this.canvasView.render(this.designModel.getElements(), this.designModel.getSelectedElements());
        this.canvasView.drawSelectionBox(
            this.interactionState.selectionStart.x,
            this.interactionState.selectionStart.y,
            x,
            y
        );
    }

    private endInteraction(): void {
        if (this.interactionState.isSelecting && this.interactionState.selectionStart) {
            // Finalize selection box
            this.finalizeSelectionBox();
        }
        
        // Reset interaction state
        this.interactionState = {
            isDragging: false,
            isResizing: false,
            isSelecting: false,
            dragStart: null,
            resizeHandle: null,
            selectionStart: null,
            originalBounds: null
        };
        
        this.currentMode = 'select';
        this.canvasView.resetCursor();
        
        // Save state if something was moved or resized
        if (this.interactionState.isDragging || this.interactionState.isResizing) {
            this.saveStateToHistory();
        }
    }

    private finalizeSelectionBox(): void {
        if (!this.interactionState.selectionStart) return;
        
        // Get current mouse position (would need to be tracked)
        // For now, implement a basic selection logic
        this.render();
    }

    // Utility methods
    private getResizeHandle(element: LayoutElement, x: number, y: number): string | null {
        const handles = element.getResizeHandles();
        const handleSize = element.resizeHandleSize;
        
        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];
            if (x >= handle.x - handleSize/2 && x <= handle.x + handleSize/2 &&
                y >= handle.y - handleSize/2 && y <= handle.y + handleSize/2) {
                return ['nw', 'ne', 'sw', 'se'][i];
            }
        }
        
        return null;
    }

    private applyResize(element: LayoutElement, original: any, handle: string, deltaX: number, deltaY: number): void {
        const minSize = 10;
        
        switch (handle) {
            case 'nw': // Northwest
                element.x = this.canvasView.snapToGrid(original.x + deltaX);
                element.y = this.canvasView.snapToGrid(original.y + deltaY);
                element.width = Math.max(minSize, original.width - deltaX);
                element.height = Math.max(minSize, original.height - deltaY);
                break;
                
            case 'ne': // Northeast
                element.y = this.canvasView.snapToGrid(original.y + deltaY);
                element.width = Math.max(minSize, original.width + deltaX);
                element.height = Math.max(minSize, original.height - deltaY);
                break;
                
            case 'sw': // Southwest
                element.x = this.canvasView.snapToGrid(original.x + deltaX);
                element.width = Math.max(minSize, original.width - deltaX);
                element.height = Math.max(minSize, original.height + deltaY);
                break;
                
            case 'se': // Southeast
                element.width = Math.max(minSize, original.width + deltaX);
                element.height = Math.max(minSize, original.height + deltaY);
                break;
        }
    }

    private updateCursor(x: number, y: number): void {
        const element = this.designModel.getElementAt(x, y);
        
        if (element && this.designModel.getSelectedElements().includes(element)) {
            const resizeHandle = this.getResizeHandle(element, x, y);
            if (resizeHandle) {
                this.updateResizeCursor(resizeHandle);
            } else {
                this.canvasView.setCursor('move');
            }
        } else {
            this.canvasView.resetCursor();
        }
    }

    private updateResizeCursor(handle: string): void {
        const cursors = {
            'nw': 'nw-resize',
            'ne': 'ne-resize',
            'sw': 'sw-resize',
            'se': 'se-resize'
        };
        
        this.canvasView.setCursor(cursors[handle as keyof typeof cursors] || 'default');
    }

    // UI event handlers
    private handleControlChange(data: any): void {
        const { type, property, value } = data;
        const selectedElements = this.designModel.getSelectedElements();
        
        if (selectedElements.length === 0) return;
        
        selectedElements.forEach(element => {
            if (element.type === type || (type === 'text' && element.type === 'text')) {
                this.elementController.updateElementProperty(element, property, value);
            }
        });
        
        this.render();
        this.saveStateToHistory();
    }

    private handleActionTrigger(data: any): void {
        const { action } = data;
        
        switch (action) {
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'duplicate':
                this.duplicateSelectedElements();
                break;
            case 'delete':
                this.deleteSelectedElements();
                break;
        }
    }

    private handleZoomChange(data: any): void {
        const { action } = data;
        let currentZoom = this.canvasView.getZoom();
        
        switch (action) {
            case 'in':
                currentZoom = Math.min(5, currentZoom * 1.2);
                break;
            case 'out':
                currentZoom = Math.max(0.1, currentZoom / 1.2);
                break;
            case 'reset':
                currentZoom = 1;
                break;
        }
        
        this.canvasView.setZoom(currentZoom);
        this.designModel.setZoom(currentZoom);
        this.uiView.updateZoomDisplay(currentZoom);
        this.render();
    }

    private handleGridToggle(): void {
        const showGrid = !this.canvasView.getShowGrid();
        this.canvasView.setShowGrid(showGrid);
        this.designModel.setShowGrid(showGrid);
        this.uiView.updateGridDisplay(showGrid);
        this.render();
    }

    private handleLockToggle(): void {
        const selectedElements = this.designModel.getSelectedElements();
        if (selectedElements.length === 0) return;
        
        const isLocked = selectedElements[0].locked;
        selectedElements.forEach(element => {
            element.locked = !isLocked;
        });
        
        this.uiView.updateControlsFromElement(selectedElements[0]);
        this.render();
    }

    // Public API methods
    public setCurrentTool(tool: string): void {
        this.currentTool = tool;
        this.canvasView.resetCursor();
    }

    public undo(): void {
        const previousState = this.historyModel.undo();
        if (previousState) {
            this.designModel.setState(previousState);
            this.canvasView.updateFromState(previousState);
            this.render();
        }
    }

    public redo(): void {
        const nextState = this.historyModel.redo();
        if (nextState) {
            this.designModel.setState(nextState);
            this.canvasView.updateFromState(nextState);
            this.render();
        }
    }

    public duplicateSelectedElements(): void {
        const selectedElements = this.designModel.getSelectedElements();
        if (selectedElements.length > 0) {
            const duplicates = this.designModel.duplicateElements(selectedElements);
            this.designModel.selectElements(duplicates);
        }
    }

    public deleteSelectedElements(): void {
        const selectedElements = this.designModel.getSelectedElements();
        if (selectedElements.length > 0) {
            this.designModel.removeElements(selectedElements);
        }
    }

    public exportLayout(): string {
        return this.designModel.exportToJSON();
    }

    public importLayout(jsonData: string): void {
        try {
            this.designModel.importFromJSON(jsonData);
            this.saveStateToHistory();
        } catch (error) {
            this.uiView.showMessage('Error importing layout: ' + error, 'error');
        }
    }

    // Private helper methods
    private render(): void {
        this.canvasView.render(this.designModel.getElements(), this.designModel.getSelectedElements());
    }

    private saveStateToHistory(): void {
        const currentState = this.designModel.getState();
        this.historyModel.saveState(currentState);
    }
}
