// src/core/canvas.ts

import { LayoutElement } from "./element";

export class DesignCanvas {
    getElements(): LayoutElement[] {
        return this.elements;
    }

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    public elements: LayoutElement[] = [];
    private selectedElement: LayoutElement | null = null;

    // Getter pubblico per l'elemento selezionato
    get currentSelection(): LayoutElement | null {
        return this.selectedElement;
    }

    // History management
    private history: LayoutElement[][] = [];
    private historyIndex: number = -1;
    private maxHistorySize: number = 50;

    private isDragging: boolean = false;
    private offsetX = 0;
    private offsetY = 0;

    private resizingHandleIndex: number | null = null;

    private editingElement: LayoutElement | null = null;
    private cursorTimer: number | null = null;

    onElementSelected: ((el: LayoutElement | null) => void) | null = null;
    onHistoryChange: ((canUndo: boolean, canRedo: boolean) => void) | null = null;
    onElementMoved: ((el: LayoutElement) => void) | null = null;
    onElementUpdated: ((el: LayoutElement) => void) | null = null;

    private refinementSuggestionsContainer: HTMLElement | null = null;
    private brainstormingSuggestionsContainer: HTMLElement | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext("2d");

        if (!context) {
            throw Error("Cannot get context");
        }
        this.ctx = context;

        this.refinementSuggestionsContainer = document.getElementById("left-panel");
        this.brainstormingSuggestionsContainer = document.getElementById("right-panel");

        this.initListeners();
        this.draw();
        this.clearRefinementSuggestionsUI(); // Initialize refinements panel
        this.saveState(); // Save initial state
    }

    exportLayout(): LayoutElement[] {
        return this.elements.map(el => new LayoutElement({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        type: el.type,
        content: el.content
        }));
    }

    addElement(element: LayoutElement) {
        this.elements.push(element);
        this.draw();
        this.saveState();
    }

    clearCanvas() {
        this.elements = [];
        this.selectedElement = null;
        this.draw();
        // Reset history when clearing canvas
        this.history = [];
        this.historyIndex = -1;
        // Notify about selection change
        if (this.onElementSelected) {
            this.onElementSelected(null);
        }
        // Notify about history change
        if (this.onHistoryChange) {
            this.onHistoryChange(false, false);
        }
    }

    private initListeners() {
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("dblclick", this.onDoubleClick.bind(this));
    }

    private snapToGrid(value: number, gridSize: number = 20): number {
        return Math.round(value / gridSize) * gridSize;
    }

    private onMouseDown(e: MouseEvent) {
        const { x, y } = this.getMousePosition(e);

        this.selectedElement = this.elements.find(el => el.contains(x, y)) || null;

        this.elements.forEach(el => (el.isSelected = el === this.selectedElement));

        if (
            this.editingElement &&
            !this.editingElement.contains(x, y)
        ) {
            this.exitTextEditing();
        }

        if (this.selectedElement) {
            const handleIndex = this.selectedElement.getResizeHandle(x, y);
            if (handleIndex !== null) {
                this.resizingHandleIndex = handleIndex;
            } else {
                this.isDragging = true;
                this.offsetX = x - this.selectedElement.x;
                this.offsetY = y - this.selectedElement.y;
            }
        }

        // Clear refinement suggestions when no element is selected
        if (!this.selectedElement) {
            this.clearRefinementSuggestionsUI();
        }

        // I suggerimenti di brainstorming sono sempre presenti, o aggiornati
      
        this.draw();
        if (this.onElementSelected) {
            this.onElementSelected(this.selectedElement);
        }
    }

    private onMouseMove(e: MouseEvent) {
        const { x, y } = this.getMousePosition(e);

        if (!this.selectedElement) {
            document.body.style.cursor = 'default';
            return;
        }

        const el = this.selectedElement;

        const right = el.x + el.width;
        const bottom = el.y + el.height;
        const minSize = 20;

        if (this.resizingHandleIndex !== null) {
            document.body.style.cursor = 'crosshair';

            switch (this.resizingHandleIndex) {
                case 0: // top-left
                    const newX0 = this.snapToGrid(x);
                    const newY0 = this.snapToGrid(y);
                    el.width = Math.max(minSize, right - newX0);
                    el.height = Math.max(minSize, bottom - newY0);
                    el.x = right - el.width;
                    el.y = bottom - el.height;
                    break;

                case 1: // top-right
                    const newX1 = this.snapToGrid(x);
                    const newY1 = this.snapToGrid(y);
                    el.width = Math.max(minSize, newX1 - el.x);
                    el.height = Math.max(minSize, bottom - newY1);
                    el.y = bottom - el.height;
                    break;

                case 2: // bottom-left
                    const newX2 = this.snapToGrid(x);
                    const newY2 = this.snapToGrid(y);
                    el.width = Math.max(minSize, right - newX2);
                    el.height = Math.max(minSize, newY2 - el.y);
                    el.x = right - el.width;
                    break;

                case 3: // bottom-right
                    const newX3 = this.snapToGrid(x);
                    const newY3 = this.snapToGrid(y);
                    el.width = Math.max(minSize, newX3 - el.x);
                    el.height = Math.max(minSize, newY3 - el.y);
                    break;
            }
            
            // Update controls in real-time during resize
            if (this.onElementUpdated) {
                this.onElementUpdated(el);
            }
        } else if (this.isDragging) {
            this.selectedElement.x = this.snapToGrid(x - this.offsetX);
            this.selectedElement.y = this.snapToGrid(y - this.offsetY);
            document.body.style.cursor = 'move';
            
            // Update controls in real-time
            if (this.onElementUpdated) {
                this.onElementUpdated(this.selectedElement);
            }
        } else {
            // Show appropriate cursor when hovering over resize handles
            const handleIndex = this.selectedElement.getResizeHandle(x, y);
            if (handleIndex !== null) {
                const cursors = ['nw-resize', 'ne-resize', 'sw-resize', 'se-resize'];
                document.body.style.cursor = cursors[handleIndex];
            } else if (this.selectedElement.contains(x, y)) {
                document.body.style.cursor = 'move';
            } else {
                document.body.style.cursor = 'default';
            }
        }


        this.draw();
    }

    private onMouseUp(e: MouseEvent) {
        const wasDragging = this.isDragging;
        const wasResizing = this.resizingHandleIndex !== null;
        
        this.isDragging = false;
        this.resizingHandleIndex = null;

        document.body.style.cursor = 'default';

        // Save state if element was moved or resized
        if (wasDragging || wasResizing) {
            this.saveState();
            
            // Call onElementMoved callback for adaptive interface
            if (this.selectedElement && this.onElementMoved) {
                this.onElementMoved(this.selectedElement);
            }
        }

        if (this.onElementSelected) {
            this.onElementSelected(this.selectedElement);
        }
        // Clear refinement suggestions
        if (!this.selectedElement) {
            this.clearRefinementSuggestionsUI();
        }

      
    }

    private onDoubleClick(e: MouseEvent) {
        const { x, y } = this.getMousePosition(e);
        const target = this.elements.find(el => el.contains(x, y) && el.type === "text");

        if (target) {
            this.exitTextEditing(); // Assicurati che solo un elemento sia in modalità di editing
            this.editingElement = target;
            target.isEditing = true;
            target.cursorVisible = true;

            this.cursorTimer = window.setInterval(() => {
                if (this.editingElement) {
                    this.editingElement.cursorVisible = !this.editingElement.cursorVisible;
                    this.draw();
                }
            }, 500);

            window.addEventListener("keydown", this.onTextInput);

            this.draw();
        }

    }

    private onTextInput = (e: KeyboardEvent) => {
        if (!this.editingElement) return;

        if (e.key === "Backspace") {
            this.editingElement.content = this.editingElement.content?.slice(0, -1) || "";
        } else if (e.key === "Enter") {
            this.editingElement.content = (this.editingElement.content || "") + "\n";
            // Per il testo, re-calcoliamo l'altezza dopo l'aggiunta di un newline
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                this.editingElement.height = this.measureTextHeight(this.editingElement, tempCtx, this.editingElement.width);
            }
        } else if (e.key.length === 1) { // Per evitare tasti come Shift, Alt, Ctrl
            this.editingElement.content = (this.editingElement.content || "") + e.key;
        }

        this.draw();
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


    private exitTextEditing() {
        if (this.editingElement) {
            this.editingElement.isEditing = false;
            this.editingElement.cursorVisible = false;
            this.editingElement = null;
        }
        if (this.cursorTimer !== null) {
            clearInterval(this.cursorTimer);
            this.cursorTimer = null;
        }
        window.removeEventListener("keydown", this.onTextInput);
        this.draw();
    }


    private getMousePosition(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    private drawGrid(spacing: number = 20) {
        const { width, height } = this.canvas;
        this.ctx.save();
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    private clearRefinementSuggestionsUI() {
        if (!this.refinementSuggestionsContainer) return;
        this.refinementSuggestionsContainer.querySelector('.sidebar-content')!.innerHTML = `
            <p class="hint-text">Select an element to see AI suggestions for improvements</p>
        `;
    }


    public draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        for (const el of this.elements) {
            el.draw(this.ctx);
        }
    }

    public clear() {
        this.elements = [];
        this.selectedElement = null;
        this.draw();
        this.saveState();
    }

    // History management methods
    public saveState() {
        // Remove any states after current index (when adding new state after undo)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Deep clone current elements state
        const currentState = this.elements.map(el => new LayoutElement({
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
        
        this.history.push(currentState);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.notifyHistoryChange();
    }

    public undo(): boolean {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
            this.notifyHistoryChange();
            return true;
        }
        return false;
    }

    public redo(): boolean {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
            this.notifyHistoryChange();
            return true;
        }
        return false;
    }

    private restoreState() {
        if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
            // Deep clone the state to restore
            this.elements = this.history[this.historyIndex].map(el => new LayoutElement({
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
            
            this.selectedElement = null;
            this.draw();
            this.clearRefinementSuggestionsUI();
            
            if (this.onElementSelected) {
                this.onElementSelected(null);
            }
        }
    }

    private notifyHistoryChange() {
        if (this.onHistoryChange) {
            const canUndo = this.historyIndex > 0;
            const canRedo = this.historyIndex < this.history.length - 1;
            this.onHistoryChange(canUndo, canRedo);
        }
    }

    public canUndo(): boolean {
        return this.historyIndex > 0;
    }

    public canRedo(): boolean {
        return this.historyIndex < this.history.length - 1;
    }
}