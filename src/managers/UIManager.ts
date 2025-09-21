// General UI and panels management

import { DesignCanvas } from "../core/canvas";
import { ControlsManager } from "./ControlsManager";
import { generateRefinementSuggestions } from "../core/ai-suggestions";
import APIService from "../services/APIService";
import { LayoutElement } from "../core/element";

export class UIManager {
    private dc: DesignCanvas;
    private autoSaveCallback: () => void;

    constructor(canvas: DesignCanvas, autoSaveCallback: () => void) {
        this.dc = canvas;
        this.autoSaveCallback = autoSaveCallback;
    }

    setupUIPanel(): void {
        // Setup for showing/hiding UI panels
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        
        // Add any general UI panel logic here if needed
        // For now, panels are visible by default
    }

    setupBrainstormingPanel(): void {
        console.log('UIManager: setupBrainstormingPanel initializing');
        const generateBtn = document.getElementById('generate-brainstorming') as HTMLButtonElement;
        const suggestionsContainer = document.getElementById('brainstorming-suggestions') as HTMLElement;
        console.log('UIManager: generateBtn=', generateBtn, 'suggestionsContainer=', suggestionsContainer);

        if (!generateBtn || !suggestionsContainer) return;

        // On click, fetch suggestions for entire canvas via APIService
        generateBtn.addEventListener('click', async () => {
            console.log('UIManager: generateBtn clicked');
            
            // Mostra indicatore di caricamento
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="material-icons spinning">refresh</span> Generating...';
            suggestionsContainer.innerHTML = '<div class="loading-indicator"><span class="material-icons spinning">refresh</span><p>Generating creative suggestions...</p></div>';
            
            try {
                const elements = this.dc.getElements();
                const canvasDimensions = this.dc.getCanvasDimensions();
                console.log('UIManager: sending elements for brainstorming', elements, 'canvas dimensions:', canvasDimensions);
                const suggestions = await APIService.getBrainstormingSuggestions(elements, canvasDimensions);
                console.log('UIManager: received suggestions', suggestions);
                
                if (suggestions.length === 0) {
                    suggestionsContainer.innerHTML = '<p class="hint-text">No ideas available.</p>';
                    return;
                }
                
                // Render suggestion name list
                suggestionsContainer.innerHTML = suggestions.map((s, i) => `
                    <div class="suggestion-item brainstorm-suggestion" data-index="${i}">
                        <div class="suggestion-icon">
                            <span class="material-icons">auto_awesome</span>
                        </div>
                        <div class="suggestion-content">
                            <p>${typeof s === 'string' ? s : (s as any).name || 'Suggestion ' + (i+1)}</p>
                        </div>
                    </div>
                `).join('');
                
                // Attach click handlers to apply layout
                const items = suggestionsContainer.querySelectorAll('.suggestion-item');
                items.forEach(item => {
                    item.addEventListener('click', () => {
                        const idx = parseInt(item.getAttribute('data-index') || '0');
                        const suggestion = suggestions[idx] as any;
                        const layoutData = (typeof suggestion === 'object' && suggestion.layout) ? suggestion.layout : null;
                        // Apply returned layout
                        this.dc.clearCanvas();
                        
                        if (layoutData) {
                            // Se layoutData è un array, usalo direttamente
                            if (Array.isArray(layoutData)) {
                                layoutData.forEach(data => {
                                    this.dc.addElement(new LayoutElement(data));
                                });
                            } 
                            // Se layoutData ha una proprietà elements che è un array
                            else if (layoutData.elements && Array.isArray(layoutData.elements)) {
                                layoutData.elements.forEach((data: any) => {
                                    this.dc.addElement(new LayoutElement(data));
                                });
                            }
                            // Fallback: prova a trattarlo come singolo elemento
                            else {
                                console.warn('Layout data structure not recognized:', layoutData);
                            }
                        }
                        this.dc.draw();
                        console.log('UIManager: applied suggestion layout', (suggestions[idx] as any).name || 'layout');
                    });
                });
                
            } catch (error) {
                console.error('Error generating suggestions:', error);
                suggestionsContainer.innerHTML = '<p class="hint-text error">Error generating suggestions. Please try again.</p>';
            } finally {
                // Ripristina il pulsante
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<span class="material-icons">auto_awesome</span> Generate Ideas';
            }
        });
        // Ensure brainstorming controls always visible
        generateBtn.disabled = false;
        suggestionsContainer.style.display = '';
    }

    setupRefinementSuggestions(): void {
        const adaptiveToggle = document.getElementById('adaptive-interface-toggle') as HTMLInputElement;
        const suggestionsContainer = document.querySelector('#left-panel .sidebar-content') as HTMLElement;

        if (!adaptiveToggle || !suggestionsContainer) return;

        // Setup adaptive interface toggle
        adaptiveToggle.addEventListener('change', (e) => {
            const isEnabled = (e.target as HTMLInputElement).checked;
            if (isEnabled) {
                this.enableAdaptiveInterface(suggestionsContainer);
            } else {
                this.disableAdaptiveInterface(suggestionsContainer);
            }
        });

        // Enable by default if checked, otherwise set up manual mode
        if (adaptiveToggle.checked) {
            this.enableAdaptiveInterface(suggestionsContainer);
        } else {
            this.disableAdaptiveInterface(suggestionsContainer);
        }
    }

    private enableAdaptiveInterface(container: HTMLElement): void {
        // Listen for element selection to automatically apply best suggestion
        this.dc.onElementSelected = (element) => {
            if (element) {
                this.autoApplyBestSuggestion(container, element);
            } else {
                this.showDefaultRefinementText(container);
            }
        };
    }

    private disableAdaptiveInterface(container: HTMLElement): void {
        // When disabled, show manual suggestions instead
        this.dc.onElementSelected = (element) => {
            if (element) {
                this.showRefinementSuggestions(container, element, false); // false = no auto-apply
            } else {
                this.showDefaultRefinementText(container);
            }
        };
    }

    private showRefinementSuggestions(container: HTMLElement, element: any, autoApply: boolean = true): void {
        const suggestions = generateRefinementSuggestions(
            element,
            this.dc.getElements(),
            1000, // canvas width
            700,  // canvas height
            () => {
                this.dc.draw();
                this.dc.saveState();
                this.autoSaveCallback();
            }
        );
        
        // If element is locked, hide refinement panel
        if ((element as any).locked) {
            container.style.display = 'none';
            return;
        }
        // Ensure panel is visible when unlocked
        container.style.display = '';
        if (suggestions.length > 0) {
            container.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item">
                    <span class="material-icons">auto_fix_high</span>
                    <p>${suggestion.description}</p>
                </div>
            `).join('');
            // Attach click handlers to apply suggestions (only when not auto-applying)
            if (!autoApply) {
                const elems = container.querySelectorAll('.suggestion-item');
                elems.forEach((item, idx) => {
                    item.addEventListener('click', () => {
                        suggestions[idx].apply();
                    });
                });
            }
        } else {
            container.innerHTML = '<p class="hint-text">No specific suggestions for this element.</p>';
        }
    }

    private showDefaultRefinementText(container: HTMLElement): void {
        container.innerHTML = '<p class="hint-text">Select an element to see AI suggestions for improvements</p>';
    }

    private autoApplyBestSuggestion(container: HTMLElement, element: any): void {
        const suggestions = generateRefinementSuggestions(
            element,
            this.dc.getElements(),
            1000, // canvas width
            700,  // canvas height
            () => {
                this.dc.draw();
                this.dc.saveState();
                this.autoSaveCallback();
            }
        );
        
        // If element is locked, hide refinement panel
        if ((element as any).locked) {
            container.style.display = 'none';
            return;
        }
        
        // Ensure panel is visible when unlocked
        container.style.display = '';
        
        if (suggestions.length > 0) {
            // Automatically apply the best suggestion (first one, as they're sorted by energy improvement)
            const bestSuggestion = suggestions[0];
            bestSuggestion.apply();
            
            // Show feedback about what was applied
            container.innerHTML = `
                <div class="auto-applied-suggestion">
                    <span class="material-icons" style="color: #4caf50;">check_circle</span>
                    <p><strong>Auto-applied:</strong> ${bestSuggestion.description}</p>
                    <small>Energy improvement: ${bestSuggestion.energyImprovement.toFixed(1)}</small>
                </div>
                ${suggestions.length > 1 ? `
                <div class="other-suggestions">
                    <p><strong>Other suggestions:</strong></p>
                    ${suggestions.slice(1).map(suggestion => `
                        <div class="suggestion-item clickable">
                            <span class="material-icons">auto_fix_high</span>
                            <p>${suggestion.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            `;
            
            // Add click handlers for remaining suggestions
            if (suggestions.length > 1) {
                const elems = container.querySelectorAll('.other-suggestions .suggestion-item');
                elems.forEach((item, idx) => {
                    item.addEventListener('click', () => {
                        suggestions[idx + 1].apply(); // +1 because we skip the first (already applied)
                    });
                });
            }
        } else {
            container.innerHTML = '<p class="hint-text">No specific suggestions for this element.</p>';
        }
    }

    setupElementCallbacks(controlsManager: ControlsManager): void {
        console.log('UIManager: setupElementCallbacks called');
        // Setup callbacks for when elements are selected/deselected
        this.dc.onElementSelected = (element) => {
            console.log('UIManager: onElementSelected called with element:', element);
            if (element) {
                controlsManager.updateControlsForElement(element);
                this.autoSaveCallback();
            } else {
                controlsManager.updateControlsForElement(null);
            }

            // Also trigger refinement suggestions if adaptive interface is enabled
            const adaptiveToggle = document.getElementById('adaptive-interface-toggle') as HTMLInputElement;
            const suggestionsContainer = document.querySelector('#left-panel .sidebar-content') as HTMLElement;
            
            if (suggestionsContainer) {
                if (element && !(element as any).locked) {
                    if (adaptiveToggle?.checked) {
                        // Auto-apply mode: apply best suggestion automatically
                        this.autoApplyBestSuggestion(suggestionsContainer, element);
                    } else {
                        // Manual mode: show suggestions for user to click
                        this.showRefinementSuggestions(suggestionsContainer, element, false);
                    }
                } else {
                    this.showDefaultRefinementText(suggestionsContainer);
                }
            }
        };

        // Setup element update callback
        this.dc.onElementUpdated = () => {
            this.autoSaveCallback();
        };
    }
}
