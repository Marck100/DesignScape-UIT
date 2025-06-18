// src/DesignCanvas.ts

import { LayoutElement } from "./layoutElement";
import { generateRefinementSuggestions, RefinementSuggestion } from "./refinementSuggestion";
import { generateBrainstormingSuggestions, BrainstormingSuggestion } from "./brainstormingSuggestion"; // <-- NUOVO IMPORT

export class DesignCanvas {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private elements: LayoutElement[] = [];
    private selectedElement: LayoutElement | null = null;

    private isDragging: boolean = false;
    private offsetX = 0;
    private offsetY = 0;

    private resizingHandleIndex: number | null = null;

    private editingElement: LayoutElement | null = null;
    private cursorTimer: number | null = null;

    onElementSelected: ((el: LayoutElement | null) => void) | null = null;

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
        this.updateBrainstormingSuggestionsUI(); // Mostra i suggerimenti di brainstorming all'avvio
    }

    addElement(element: LayoutElement) {
        this.elements.push(element);
        this.draw();
        this.updateBrainstormingSuggestionsUI(); // Aggiorna i suggerimenti di brainstorming quando si aggiunge un elemento
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

        if (this.selectedElement) {
            const suggestions = generateRefinementSuggestions(
                this.selectedElement,
                this.elements,
                this.canvas.width,
                this.canvas.height,
                () => this.draw()
            );
            this.showRefinementSuggestionsUI(suggestions);
        } else {
            this.clearRefinementSuggestionsUI();
        }

        // I suggerimenti di brainstorming sono sempre presenti, o aggiornati
        this.updateBrainstormingSuggestionsUI();
        this.draw();
        if (this.onElementSelected) {
            this.onElementSelected(this.selectedElement);
        }
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.selectedElement) {
            return;
        }

        const { x, y } = this.getMousePosition(e);
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
        } else if (this.isDragging) {
            this.selectedElement.x = this.snapToGrid(x - this.offsetX);
            this.selectedElement.y = this.snapToGrid(y - this.offsetY);
            document.body.style.cursor = 'default';
        }


        this.draw();
    }

    private onMouseUp(e: MouseEvent) {
        this.isDragging = false;
        this.resizingHandleIndex = null;

        document.body.style.cursor = 'default';

        if (this.onElementSelected) {
            this.onElementSelected(this.selectedElement);
        }
        // Aggiorna i suggerimenti di refinement anche dopo il dragging/resizing
        if (this.selectedElement) {
            const suggestions = generateRefinementSuggestions(
                this.selectedElement,
                this.elements,
                this.canvas.width,
                this.canvas.height,
                () => this.draw()
            );
            this.showRefinementSuggestionsUI(suggestions);
        } else {
            this.clearRefinementSuggestionsUI();
        }

        this.updateBrainstormingSuggestionsUI(); // Aggiorna anche questi
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

    private showRefinementSuggestionsUI(suggestions: RefinementSuggestion[]) {
        if (!this.refinementSuggestionsContainer) return;
        this.refinementSuggestionsContainer.innerHTML = "<strong>Refinements</strong>";

        for (const suggestion of suggestions) {
            const div = document.createElement("div");
            div.className = "suggestion-preview";
            div.innerText = suggestion.description;
            div.onclick = () => {
                suggestion.apply();
                this.updateBrainstormingSuggestionsUI(); // Aggiorna i brainstorming dopo l'applicazione di un refinement
            };
            this.refinementSuggestionsContainer.appendChild(div);
        }
    }

    private clearRefinementSuggestionsUI() {
        if (!this.refinementSuggestionsContainer) return;
        this.refinementSuggestionsContainer.innerHTML = "<strong>Refinements</strong>";
    }

    private updateBrainstormingSuggestionsUI() {
        if (!this.brainstormingSuggestionsContainer) return;
        this.brainstormingSuggestionsContainer.innerHTML = "<strong>Brainstorming</strong>";

        const suggestions = generateBrainstormingSuggestions(
            this.elements,
            this.canvas.width,
            this.canvas.height
        );

        for (const suggestion of suggestions) {
            const div = document.createElement("div");
            div.className = "suggestion-preview brainstorming-preview";
            div.innerText = suggestion.description;
            div.onclick = () => {
                // Applica il suggerimento creando un *nuovo* set di elementi
                this.elements = suggestion.apply(this.elements, this.canvas.width, this.canvas.height);
                this.selectedElement = null; // Deseleziona tutto dopo aver applicato un nuovo layout
                this.clearRefinementSuggestionsUI(); // Pulisci i suggerimenti di refinement
                this.draw();
                // Rigenera i suggerimenti di brainstorming dopo aver applicato un nuovo layout
                this.updateBrainstormingSuggestionsUI();
                // Assicurati che il pannello di controllo dell'elemento selezionato sia nascosto
                if (this.onElementSelected) {
                    this.onElementSelected(null);
                }
            };
            this.brainstormingSuggestionsContainer.appendChild(div);
        }
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        for (const el of this.elements) {
            el.draw(this.ctx);
        }
    }
}