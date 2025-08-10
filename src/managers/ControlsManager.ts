// User interface controls management

import { DesignCanvas } from "../core/canvas";
import { LayoutElement } from "../core/element";
import { TextAlign } from "../types/element";
import { snapToGrid, validateDimension, validateFontSize, calculateIncrementValue } from "../utils/gridUtils";

export class ControlsManager {
    private dc: DesignCanvas;
    private autoSaveCallback: () => void;
    
    // UI Elements
    private boxControls!: {
        x: HTMLInputElement;
        y: HTMLInputElement;
        width: HTMLInputElement;
        height: HTMLInputElement;
        color: HTMLInputElement;
    };
    
    private textControls!: {
        x: HTMLInputElement;
        y: HTMLInputElement;
        width: HTMLInputElement;
        height: HTMLInputElement;
        fontFamily: HTMLSelectElement;
        fontSize: HTMLInputElement;
        fontColor: HTMLInputElement;
    };
    // Lock control UI
    private lockSection!: HTMLElement;
    private lockBtn!: HTMLButtonElement;

    // Text state
    private currentTextAlign: TextAlign = 'left';
    private currentFontBold = false;
    private currentFontItalic = false;

    constructor(canvas: DesignCanvas, autoSaveCallback: () => void) {
        this.dc = canvas;
        this.autoSaveCallback = autoSaveCallback;
        this.initializeControls();
        this.setupEventListeners();
    }

    private initializeControls(): void {
        this.boxControls = {
            x: document.getElementById("box-x") as HTMLInputElement,
            y: document.getElementById("box-y") as HTMLInputElement,
            width: document.getElementById("box-width") as HTMLInputElement,
            height: document.getElementById("box-height") as HTMLInputElement,
            color: document.getElementById("box-color") as HTMLInputElement
        };
        
        this.textControls = {
            x: document.getElementById("text-x") as HTMLInputElement,
            y: document.getElementById("text-y") as HTMLInputElement,
            width: document.getElementById("text-width") as HTMLInputElement,
            height: document.getElementById("text-height") as HTMLInputElement,
            fontFamily: document.getElementById("font-family") as HTMLSelectElement,
            fontSize: document.getElementById("font-size") as HTMLInputElement,
            fontColor: document.getElementById("font-color") as HTMLInputElement
        };
        // Lock UI
        this.lockSection = document.getElementById("lock-section") as HTMLElement;
        this.lockBtn = document.getElementById("lock-btn") as HTMLButtonElement;
    }

    private setupEventListeners(): void {
        // Box color
        this.boxControls.color.addEventListener("input", () => this.updateBoxColor());
        
        // Text style controls
        this.textControls.fontFamily.addEventListener("change", () => this.updateSelectedTextElement());
        this.textControls.fontColor.addEventListener("input", () => this.updateSelectedTextElement());
        // Lock toggle
        this.lockBtn.addEventListener('click', () => this.toggleLock());
        
        // Setup numeric inputs
        this.setupBoxInputs();
        this.setupTextInputs();
        this.setupTextFormatting();
    }

    // Toggle lock state for selected element
    private toggleLock(): void {
        const sel = this.dc.currentSelection;
        if (!sel) return;
        sel.locked = !sel.locked;
        this.lockBtn.classList.toggle('active', sel.locked);
        const icon = this.lockBtn.querySelector('span.material-icons');
        if (icon) icon.textContent = sel.locked ? 'lock' : 'lock_open';
        this.dc.draw();
        // Trigger selection callback to refresh UI panels (refinements, brainstorming)
        if (this.dc.onElementSelected) {
            this.dc.onElementSelected(sel);
        }
    }

    private setupBoxInputs(): void {
        const inputs = [this.boxControls.x, this.boxControls.y, this.boxControls.width, this.boxControls.height];
        
        inputs.forEach(input => {
            this.setupNumericInput(input, 'box');
        });
    }

    private setupTextInputs(): void {
        const inputs = [this.textControls.x, this.textControls.y, this.textControls.width, this.textControls.height, this.textControls.fontSize];
        
        inputs.forEach(input => {
            this.setupNumericInput(input, 'text');
        });
    }

    private setupNumericInput(input: HTMLInputElement, type: 'box' | 'text'): void {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur();
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                this.handleArrowKeyIncrement(input, e.key === "ArrowUp" ? 1 : -1, type);
            }
        });
        
        input.addEventListener("change", () => {
            this.handleInputChange(input, type);
        });
        
        input.addEventListener("blur", () => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    private handleArrowKeyIncrement(input: HTMLInputElement, direction: number, type: 'box' | 'text'): void {
        const currentValue = parseInt(input.value) || 0;
        let newValue: number;
        
        if (input === this.textControls.fontSize) {
            newValue = Math.max(8, Math.min(72, currentValue + (direction * 2)));
        } else {
            const isDimension = input.id.includes('width') || input.id.includes('height');
            const minValue = this.getMinValue(input, type);
            newValue = calculateIncrementValue(currentValue, direction, isDimension, minValue);
        }
        
        input.value = newValue.toString();
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    private handleInputChange(input: HTMLInputElement, type: 'box' | 'text'): void {
        const currentValue = parseInt(input.value) || 0;
        let correctedValue: number;
        
        if (input === this.textControls.fontSize) {
            correctedValue = validateFontSize(currentValue);
        } else if (input.id.includes('width') || input.id.includes('height')) {
            const minValue = this.getMinValue(input, type);
            correctedValue = validateDimension(currentValue, minValue);
        } else {
            correctedValue = snapToGrid(currentValue);
        }
        
        if (correctedValue !== currentValue) {
            input.value = correctedValue.toString();
        }
        
        if (type === 'box') {
            this.updateSelectedBoxElement();
        } else {
            this.updateSelectedTextElement();
        }
    }

    private getMinValue(input: HTMLInputElement, type: 'box' | 'text'): number {
        const isWidth = input.id.includes('width');
        if (type === 'box') return 20;
        return isWidth ? 40 : 20;
    }

    private updateBoxColor(): void {
        const sel = this.dc.currentSelection;
        if (sel && sel.type === "box") {
            sel.fillColor = this.boxControls.color.value;
            this.dc.draw();
            this.dc.saveState();
            this.autoSaveCallback();
        }
    }

    private updateSelectedBoxElement(): void {
        const sel = this.dc.currentSelection;
        // Apply position/size updates for box and image elements
        if (sel && (sel.type === "box" || sel.type === "image")) {
            const newX = snapToGrid(parseInt(this.boxControls.x.value) || 0);
            const newY = snapToGrid(parseInt(this.boxControls.y.value) || 0);
            const newWidth = validateDimension(parseInt(this.boxControls.width.value) || 50, 20);
            const newHeight = validateDimension(parseInt(this.boxControls.height.value) || 50, 20);
            
            sel.x = newX;
            sel.y = newY;
            sel.width = newWidth;
            sel.height = newHeight;
            
            this.updateBoxInputValues(sel);
            this.dc.draw();
            this.dc.saveState();
            this.autoSaveCallback();
        }
    }

    private updateSelectedTextElement(): void {
        const sel = this.dc.currentSelection;
        if (sel && sel.type === "text") {
            const newX = snapToGrid(parseInt(this.textControls.x.value) || 0);
            const newY = snapToGrid(parseInt(this.textControls.y.value) || 0);
            const newWidth = validateDimension(parseInt(this.textControls.width.value) || 100, 40);
            const newHeight = validateDimension(parseInt(this.textControls.height.value) || 30, 20);
            
            sel.x = newX;
            sel.y = newY;
            sel.width = newWidth;
            sel.height = newHeight;
            
            sel.fontFamily = this.textControls.fontFamily.value;
            sel.textAlign = this.currentTextAlign;
            sel.fontSize = validateFontSize(parseInt(this.textControls.fontSize.value) || 20);
            sel.fontColor = this.textControls.fontColor.value;
            sel.fontBold = this.currentFontBold;
            sel.fontItalic = this.currentFontItalic;
            
            this.updateTextInputValues(sel);
            this.dc.draw();
            this.dc.saveState();
            this.autoSaveCallback();
        }
    }

    private updateBoxInputValues(element: LayoutElement): void {
        this.boxControls.x.value = element.x.toString();
        this.boxControls.y.value = element.y.toString();
        this.boxControls.width.value = element.width.toString();
        this.boxControls.height.value = element.height.toString();
    }

    private updateTextInputValues(element: LayoutElement): void {
        this.textControls.x.value = element.x.toString();
        this.textControls.y.value = element.y.toString();
        this.textControls.width.value = element.width.toString();
        this.textControls.height.value = element.height.toString();
        this.textControls.fontSize.value = element.fontSize.toString();
    }

    private setupTextFormatting(): void {
        const alignButtons = document.querySelectorAll('.toolbar-btn[data-align]');
        const boldBtn = document.getElementById("font-bold-btn") as HTMLButtonElement;
        const italicBtn = document.getElementById("font-italic-btn") as HTMLButtonElement;

        alignButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                alignButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTextAlign = btn.getAttribute('data-align') as TextAlign;
                this.updateSelectedTextElement();
            });
        });
        
        boldBtn.addEventListener('click', () => {
            this.currentFontBold = !this.currentFontBold;
            boldBtn.classList.toggle('active', this.currentFontBold);
            this.updateSelectedTextElement();
        });
        
        italicBtn.addEventListener('click', () => {
            this.currentFontItalic = !this.currentFontItalic;
            italicBtn.classList.toggle('active', this.currentFontItalic);
            this.updateSelectedTextElement();
        });
    }

    // Public methods to update controls when element changes
    updateControlsForElement(element: LayoutElement | null): void {
        // Hide all toolbar sections by default
        const boxProps = document.getElementById("box-properties") as HTMLElement;
        const textProps = document.getElementById("text-properties") as HTMLElement;
        const emptyProps = document.getElementById("empty-properties") as HTMLElement;
        this.lockSection.style.display = 'none';
        this.lockBtn.classList.remove('active');
        boxProps.style.display = 'none';
        textProps.style.display = 'none';
        emptyProps.style.display = 'none';

        if (!element) {
            // No element selected: show empty state
            emptyProps.style.display = '';
            return;
        }

        // Show lock UI when an element is selected
        this.lockSection.style.display = 'flex';
        this.lockBtn.classList.toggle('active', element.locked);
        const icon = this.lockBtn.querySelector('span.material-icons');
        if (icon) icon.textContent = element.locked ? 'lock' : 'lock_open';

        if (element.type === "box" || element.type === "image") {
            // Show box/image position & size
            boxProps.style.display = '';
            textProps.style.display = "none";
            this.updateBoxInputValues(element);
            // Show fill color only for boxes
            const fillSection = this.boxControls.color.closest('.toolbar-section') as HTMLElement;
            if (element.type === "box") {
                fillSection.style.display = '';
                this.boxControls.color.value = element.fillColor ?? "#007acc";
            } else {
                fillSection.style.display = 'none';
            }
        } else if (element.type === "text") {
            // Show text properties
            textProps.style.display = '';
            this.updateTextInputValues(element);
            this.textControls.fontFamily.value = element.fontFamily;
            this.textControls.fontColor.value = element.fontColor;
            
            this.currentTextAlign = element.textAlign;
            this.currentFontBold = element.fontBold;
            this.currentFontItalic = element.fontItalic;
            
            this.updateTextFormattingButtons();
        }
    }

    private updateTextFormattingButtons(): void {
        const alignButtons = document.querySelectorAll('.toolbar-btn[data-align]');
        const boldBtn = document.getElementById("font-bold-btn") as HTMLButtonElement;
        const italicBtn = document.getElementById("font-italic-btn") as HTMLButtonElement;

        alignButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-align') === this.currentTextAlign);
        });
        
        boldBtn.classList.toggle('active', this.currentFontBold);
        italicBtn.classList.toggle('active', this.currentFontItalic);
    }
}
