// src/views/UIView.ts
// View che gestisce i pannelli UI e i controlli

import { LayoutElement, TextAlign } from "../core/element";

export interface UIControlsData {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    fontBold?: boolean;
    fontItalic?: boolean;
    textAlign?: TextAlign;
    fillColor?: string;
    locked?: boolean;
}

export class UIView {
    private listeners: Map<string, Function[]> = new Map();
    
    // UI Elements references
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

    private lockSection!: HTMLElement;
    private lockBtn!: HTMLButtonElement;
    private refinementSuggestionsContainer: HTMLElement | null = null;
    private brainstormingSuggestionsContainer: HTMLElement | null = null;

    constructor() {
        this.initializeEventSystem();
        this.initializeUIControls();
        this.setupEventListeners();
    }

    private initializeEventSystem(): void {
        this.listeners.set('controlChanged', []);
        this.listeners.set('toolSelected', []);
        this.listeners.set('actionTriggered', []);
        this.listeners.set('zoomChanged', []);
        this.listeners.set('gridToggled', []);
        this.listeners.set('lockToggled', []);
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

    private initializeUIControls(): void {
        this.initializeBoxControls();
        this.initializeTextControls();
        this.initializeLockControls();
        this.initializeToolControls();
        this.initializeActionControls();
        this.initializeZoomControls();
        this.initializeGridControls();
        this.initializePanels();
    }

    private initializeBoxControls(): void {
        this.boxControls = {
            x: document.getElementById('box-x') as HTMLInputElement,
            y: document.getElementById('box-y') as HTMLInputElement,
            width: document.getElementById('box-width') as HTMLInputElement,
            height: document.getElementById('box-height') as HTMLInputElement,
            color: document.getElementById('box-color') as HTMLInputElement
        };
    }

    private initializeTextControls(): void {
        this.textControls = {
            x: document.getElementById('text-x') as HTMLInputElement,
            y: document.getElementById('text-y') as HTMLInputElement,
            width: document.getElementById('text-width') as HTMLInputElement,
            height: document.getElementById('text-height') as HTMLInputElement,
            fontFamily: document.getElementById('font-family') as HTMLSelectElement,
            fontSize: document.getElementById('font-size') as HTMLInputElement,
            fontColor: document.getElementById('font-color') as HTMLInputElement
        };
    }

    private initializeLockControls(): void {
        this.lockSection = document.getElementById('lock-section')!;
        this.lockBtn = document.getElementById('lock-btn') as HTMLButtonElement;
    }

    private initializeToolControls(): void {
        const tools = ['select', 'text', 'image', 'box'];
        
        tools.forEach(tool => {
            const button = document.getElementById(`${tool}-tool`);
            if (button) {
                button.addEventListener('click', () => {
                    this.selectTool(tool);
                });
            }
        });
    }

    private initializeActionControls(): void {
        // History controls
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.emit('actionTriggered', { action: 'undo' });
            });
        }
        
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.emit('actionTriggered', { action: 'redo' });
            });
        }

        // Edit controls
        const duplicateBtn = document.getElementById('duplicate-btn');
        const deleteBtn = document.getElementById('delete-btn');
        
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => {
                this.emit('actionTriggered', { action: 'duplicate' });
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.emit('actionTriggered', { action: 'delete' });
            });
        }
    }

    private initializeZoomControls(): void {
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const zoomResetBtn = document.getElementById('zoom-reset');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.emit('zoomChanged', { action: 'in' });
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.emit('zoomChanged', { action: 'out' });
            });
        }
        
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => {
                this.emit('zoomChanged', { action: 'reset' });
            });
        }
    }

    private initializeGridControls(): void {
        const gridToggle = document.getElementById('grid-toggle');
        
        if (gridToggle) {
            gridToggle.addEventListener('click', () => {
                this.emit('gridToggled');
            });
        }
    }

    private initializePanels(): void {
        this.refinementSuggestionsContainer = document.getElementById("left-panel");
        this.brainstormingSuggestionsContainer = document.getElementById("right-panel");
    }

    private setupEventListeners(): void {
        // Box controls
        Object.entries(this.boxControls).forEach(([key, control]) => {
            if (control) {
                control.addEventListener('input', () => {
                    this.emit('controlChanged', {
                        type: 'box',
                        property: key,
                        value: this.getControlValue(control)
                    });
                });
            }
        });

        // Text controls
        Object.entries(this.textControls).forEach(([key, control]) => {
            if (control) {
                control.addEventListener('input', () => {
                    this.emit('controlChanged', {
                        type: 'text',
                        property: key,
                        value: this.getControlValue(control)
                    });
                });
            }
        });

        // Text formatting controls
        this.setupTextFormattingControls();

        // Lock control
        if (this.lockBtn) {
            this.lockBtn.addEventListener('click', () => {
                this.emit('lockToggled');
            });
        }
    }

    private setupTextFormattingControls(): void {
        const boldBtn = document.getElementById('bold-btn');
        const italicBtn = document.getElementById('italic-btn');
        const leftAlignBtn = document.getElementById('left-align');
        const centerAlignBtn = document.getElementById('center-align');
        const rightAlignBtn = document.getElementById('right-align');

        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                this.emit('controlChanged', {
                    type: 'text',
                    property: 'fontBold',
                    value: !boldBtn.classList.contains('active')
                });
            });
        }

        if (italicBtn) {
            italicBtn.addEventListener('click', () => {
                this.emit('controlChanged', {
                    type: 'text',
                    property: 'fontItalic',
                    value: !italicBtn.classList.contains('active')
                });
            });
        }

        [leftAlignBtn, centerAlignBtn, rightAlignBtn].forEach((btn, index) => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const alignValues: TextAlign[] = ['left', 'center', 'right'];
                    this.emit('controlChanged', {
                        type: 'text',
                        property: 'textAlign',
                        value: alignValues[index]
                    });
                });
            }
        });
    }

    private getControlValue(control: HTMLElement): any {
        if (control instanceof HTMLInputElement) {
            if (control.type === 'number') {
                return parseFloat(control.value) || 0;
            } else if (control.type === 'checkbox') {
                return control.checked;
            } else if (control.type === 'color') {
                return control.value;
            } else {
                return control.value;
            }
        } else if (control instanceof HTMLSelectElement) {
            return control.value;
        }
        return control.textContent || '';
    }

    private selectTool(toolName: string): void {
        // Update tool button states
        const tools = ['select', 'text', 'image', 'box'];
        tools.forEach(tool => {
            const button = document.getElementById(`${tool}-tool`);
            if (button) {
                button.classList.toggle('active', tool === toolName);
            }
        });

        this.emit('toolSelected', { tool: toolName });
    }

    // Public methods for updating UI state
    public updateControlsFromElement(element: LayoutElement | null): void {
        this.showControlsForElement(element);
        
        if (element) {
            this.populateControlsWithElementData(element);
            this.updateLockState(element.locked);
        }
    }

    private showControlsForElement(element: LayoutElement | null): void {
        // Hide all control panels first
        const boxSection = document.getElementById('box-section');
        const textSection = document.getElementById('text-section');
        
        if (boxSection) boxSection.style.display = 'none';
        if (textSection) textSection.style.display = 'none';
        
        if (!element) return;

        // Show relevant controls based on element type
        if (element.type === 'box') {
            if (boxSection) boxSection.style.display = 'block';
        } else if (element.type === 'text') {
            if (textSection) textSection.style.display = 'block';
        }
        
        // Always show lock section if element is selected
        if (this.lockSection) {
            this.lockSection.style.display = element ? 'block' : 'none';
        }
    }

    private populateControlsWithElementData(element: LayoutElement): void {
        // Prevent infinite loops by temporarily removing listeners
        this.pauseControlListeners();

        // Update position and size controls based on element type
        if (element.type === 'box' && this.boxControls.x) {
            this.boxControls.x.value = element.x.toString();
            this.boxControls.y.value = element.y.toString();
            this.boxControls.width.value = element.width.toString();
            this.boxControls.height.value = element.height.toString();
            this.boxControls.color.value = element.fillColor || '#007acc';
        }

        if (element.type === 'text' && this.textControls.x) {
            this.textControls.x.value = element.x.toString();
            this.textControls.y.value = element.y.toString();
            this.textControls.width.value = element.width.toString();
            this.textControls.height.value = element.height.toString();
            this.textControls.fontFamily.value = element.fontFamily;
            this.textControls.fontSize.value = element.fontSize.toString();
            this.textControls.fontColor.value = element.fontColor;
        }

        // Update text formatting buttons
        this.updateTextFormattingButtons(element);

        // Resume listeners
        this.resumeControlListeners();
    }

    private updateTextFormattingButtons(element: LayoutElement): void {
        const boldBtn = document.getElementById('bold-btn');
        const italicBtn = document.getElementById('italic-btn');
        const leftAlignBtn = document.getElementById('left-align');
        const centerAlignBtn = document.getElementById('center-align');
        const rightAlignBtn = document.getElementById('right-align');

        if (boldBtn) {
            boldBtn.classList.toggle('active', element.fontBold);
        }
        
        if (italicBtn) {
            italicBtn.classList.toggle('active', element.fontItalic);
        }

        // Update alignment buttons
        [leftAlignBtn, centerAlignBtn, rightAlignBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        if (element.textAlign === 'left' && leftAlignBtn) {
            leftAlignBtn.classList.add('active');
        } else if (element.textAlign === 'center' && centerAlignBtn) {
            centerAlignBtn.classList.add('active');
        } else if (element.textAlign === 'right' && rightAlignBtn) {
            rightAlignBtn.classList.add('active');
        }
    }

    private updateLockState(locked: boolean): void {
        if (this.lockBtn) {
            this.lockBtn.textContent = locked ? 'Unlock' : 'Lock';
            this.lockBtn.classList.toggle('locked', locked);
        }
    }

    private pauseControlListeners(): void {
        // Implementation would temporarily disable control listeners
        // This is a placeholder for the actual implementation
    }

    private resumeControlListeners(): void {
        // Implementation would re-enable control listeners
        // This is a placeholder for the actual implementation
    }

    // History UI updates
    public updateHistoryControls(canUndo: boolean, canRedo: boolean): void {
        const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
        const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement;
        
        if (undoBtn) {
            undoBtn.disabled = !canUndo;
        }
        
        if (redoBtn) {
            redoBtn.disabled = !canRedo;
        }
    }

    // Suggestions panels management
    public updateRefinementSuggestions(suggestions: string[] | null): void {
        if (!this.refinementSuggestionsContainer) return;
        
        const content = this.refinementSuggestionsContainer.querySelector('.sidebar-content');
        if (!content) return;

        if (!suggestions || suggestions.length === 0) {
            content.innerHTML = `
                <p class="hint-text">Select an element to see AI suggestions for improvements</p>
            `;
        } else {
            content.innerHTML = `
                <h3>AI Suggestions</h3>
                <div class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <p>${suggestion}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    public updateBrainstormingSuggestions(suggestions: string[] | null): void {
        if (!this.brainstormingSuggestionsContainer) return;
        
        const content = this.brainstormingSuggestionsContainer.querySelector('.sidebar-content');
        if (!content) return;

        if (!suggestions || suggestions.length === 0) {
            content.innerHTML = `
                <h3>Brainstorming</h3>
                <p class="hint-text">Ideas and inspiration for your design</p>
            `;
        } else {
            content.innerHTML = `
                <h3>Design Ideas</h3>
                <div class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <p>${suggestion}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Zoom display
    public updateZoomDisplay(zoom: number): void {
        const zoomDisplay = document.getElementById('zoom-display');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
        }
    }

    // Grid display
    public updateGridDisplay(showGrid: boolean): void {
        const gridToggle = document.getElementById('grid-toggle');
        if (gridToggle) {
            gridToggle.classList.toggle('active', showGrid);
        }
    }

    // Error and success messages
    public showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        // Create or update a message element
        let messageEl = document.getElementById('ui-message');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'ui-message';
            messageEl.className = 'ui-message';
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `ui-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.style.display = 'none';
            }
        }, 3000);
    }
}
