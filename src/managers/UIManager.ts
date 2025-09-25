// General UI and panels management for the DesignScope interface

import { DesignCanvas } from "../core/canvas";
import { ControlsManager } from "./ControlsManager";
import { generateRefinementSuggestions } from "../core/ai-suggestions";
import APIService from "../services/APIService";
import { LayoutElement } from "../core/element";

/**
 * Manages UI panels, brainstorming functionality, and refinement suggestions.
 * Coordinates between the canvas and various UI components.
 */
export class UIManager {
    private dc: DesignCanvas;
    private autoSaveCallback: () => void;

    /**
     * Creates a new UIManager instance
     * @param canvas - The design canvas to manage UI for
     * @param autoSaveCallback - Function to call when auto-save is needed
     */
    constructor(canvas: DesignCanvas, autoSaveCallback: () => void) {
        this.dc = canvas;
        this.autoSaveCallback = autoSaveCallback;
    }

    /**
     * Sets up the main UI panels (left and right sidebars)
     */
    setupUIPanel(): void {
        // Setup for showing/hiding UI panels
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        
        // Add any general UI panel logic here if needed
        // For now, panels are visible by default
    }

    /**
     * Sets up the brainstorming panel with AI suggestion generation
     */
    setupBrainstormingPanel(): void {
        console.log('UIManager: setupBrainstormingPanel initializing');
        const generateBtn = document.getElementById('generate-brainstorming') as HTMLButtonElement;
        const suggestionsContainer = document.getElementById('brainstorming-suggestions') as HTMLElement;
        console.log('UIManager: generateBtn=', generateBtn, 'suggestionsContainer=', suggestionsContainer);

        if (!generateBtn || !suggestionsContainer) return;

        // Handle brainstorming generation button click
        generateBtn.addEventListener('click', async () => {
            console.log('UIManager: generateBtn clicked');
            
            // Get selected LLM model
            const modelSelect = document.getElementById('llm-model-select') as HTMLSelectElement;
            const modelSelection = document.querySelector('.model-selection') as HTMLElement;
            const selectedModel = modelSelect ? modelSelect.value : 'gpt-4o';
            console.log('UIManager: selected LLM model:', selectedModel);
            
            // Add loading state to model selector
            if (modelSelection) {
                modelSelection.classList.add('loading');
            }
            
            // Show loading indicator
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="material-icons spinning">refresh</span> Generating...';
            suggestionsContainer.innerHTML = '<div class="loading-indicator"><span class="material-icons spinning">refresh</span><p>Generating creative suggestions...</p></div>';
            
            try {
                const elements = this.dc.getElements();
                const canvasDimensions = this.dc.getCanvasDimensions();
                console.log('UIManager: sending elements for brainstorming', elements, 'canvas dimensions:', canvasDimensions, 'model:', selectedModel);
                const suggestions = await APIService.getBrainstormingSuggestions(elements, canvasDimensions, selectedModel);
                console.log('UIManager: received suggestions', suggestions);
                console.log('UIManager: suggestions type:', typeof suggestions);
                console.log('UIManager: suggestions length:', suggestions?.length);
                
                if (suggestions.length > 0) {
                    console.log('UIManager: first suggestion structure:', suggestions[0]);
                    console.log('UIManager: first suggestion type:', typeof suggestions[0]);
                    if (typeof suggestions[0] === 'object') {
                        console.log('UIManager: first suggestion keys:', Object.keys(suggestions[0] || {}));
                    }
                }
                
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
                        console.log('UIManager: applying suggestion at index', idx);
                        console.log('UIManager: suggestion object:', suggestion);
                        console.log('UIManager: suggestion type:', typeof suggestion);
                        
                        if (typeof suggestion === 'object') {
                            console.log('UIManager: suggestion keys:', Object.keys(suggestion));
                        }
                        
                        const layoutData = (typeof suggestion === 'object' && suggestion.layout) ? suggestion.layout : null;
                        console.log('UIManager: extracted layoutData:', layoutData);
                        console.log('UIManager: layoutData type:', typeof layoutData);
                        console.log('UIManager: layoutData is array:', Array.isArray(layoutData));
                        
                        if (layoutData && Array.isArray(layoutData)) {
                            console.log('UIManager: layoutData length:', layoutData.length);
                            console.log('UIManager: first layout element:', layoutData[0]);
                        }
                        
                        // Apply returned layout to canvas
                        this.dc.clearCanvas();
                        
                        if (layoutData) {
                            // If layoutData is an array of elements, use it directly
                            if (Array.isArray(layoutData)) {
                                console.log('UIManager: applying layoutData as array');
                                layoutData.forEach((data, index) => {
                                    console.log(`UIManager: adding element ${index}:`, data);
                                    try {
                                        this.dc.addElement(new LayoutElement(data));
                                    } catch (error) {
                                        console.error(`UIManager: error creating element ${index}:`, error);
                                    }
                                });
                            } 
                            // If layoutData has an elements property that is an array
                            else if (layoutData.elements && Array.isArray(layoutData.elements)) {
                                console.log('UIManager: applying layoutData.elements as array');
                                layoutData.elements.forEach((data: any, index: number) => {
                                    console.log(`UIManager: adding element ${index}:`, data);
                                    try {
                                        this.dc.addElement(new LayoutElement(data));
                                    } catch (error) {
                                        console.error(`UIManager: error creating element ${index}:`, error);
                                    }
                                });
                            }
                            // Fallback: prova a trattarlo come singolo elemento
                            else {
                                console.warn('UIManager: Layout data structure not recognized:', layoutData);
                                console.log('UIManager: trying to apply as single element');
                                try {
                                    this.dc.addElement(new LayoutElement(layoutData));
                                } catch (error) {
                                    console.error('UIManager: error creating single element:', error);
                                }
                            }
                        } else {
                            console.warn('UIManager: No layoutData found in suggestion');
                        }
                        
                        console.log('UIManager: calling dc.draw() to render canvas');
                        this.dc.draw();
                        console.log('UIManager: canvas elements count:', this.dc.getElements().length);
                        console.log('UIManager: applied suggestion layout', (suggestions[idx] as any).name || 'layout');
                    });
                });
                
            } catch (error) {
                console.error('Error generating suggestions:', error);
                suggestionsContainer.innerHTML = '<p class="hint-text error">Error generating suggestions. Please try again.</p>';
            } finally {
                // Remove loading state from model selector
                if (modelSelection) {
                    modelSelection.classList.remove('loading');
                }
                
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
        const allSuggestions = generateRefinementSuggestions(
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
        
        // For auto-apply, skip the first 2 canvas alignment suggestions and use only energy-based ones
        const energyBasedSuggestions = allSuggestions.slice(2); // Skip first 2 (canvas alignment)
        
        if (energyBasedSuggestions.length > 0) {
            // Automatically apply the best energy-based suggestion
            const bestSuggestion = energyBasedSuggestions[0];
            bestSuggestion.apply();
            
            // Show feedback about what was applied
            container.innerHTML = `
                <div class="auto-applied-suggestion">
                    <span class="material-icons" style="color: #4caf50;">check_circle</span>
                    <p><strong>Auto-applied:</strong> ${bestSuggestion.description}</p>
                    <small>Energy improvement: ${bestSuggestion.energyImprovement.toFixed(1)}</small>
                </div>
                ${energyBasedSuggestions.length > 1 ? `
                <div class="other-suggestions">
                    <p><strong>Other suggestions:</strong></p>
                    ${energyBasedSuggestions.slice(1).map(suggestion => `
                        <div class="suggestion-item clickable">
                            <span class="material-icons">auto_fix_high</span>
                            <p>${suggestion.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            `;
            
            // Add click handlers for remaining energy-based suggestions
            if (energyBasedSuggestions.length > 1) {
                const elems = container.querySelectorAll('.other-suggestions .suggestion-item');
                elems.forEach((item, idx) => {
                    item.addEventListener('click', () => {
                        energyBasedSuggestions[idx + 1].apply(); // +1 because we skip the first (already applied)
                    });
                });
            }
        } else {
            container.innerHTML = '<p class="hint-text">No energy-based suggestions available for this element.</p>';
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
