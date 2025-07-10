// src/managers/UIManager.ts
// Gestisce l'interfaccia utente generale e i pannelli

import { DesignCanvas } from "../core/canvas";
import { ControlsManager } from "./ControlsManager";
import { generateRefinementSuggestions } from "../core/ai-suggestions";

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
        const generateBtn = document.getElementById('generate-brainstorming') as HTMLButtonElement;
        const suggestionsContainer = document.getElementById('brainstorming-suggestions') as HTMLElement;

        if (!generateBtn || !suggestionsContainer) return;

        generateBtn.addEventListener('click', () => {
            this.generateBrainstormingIdeas(suggestionsContainer);
        });
        // Disable brainstorming when locked or no element
        this.dc.onElementSelected = (element) => {
            if (!element || (element as any).locked) {
                generateBtn.disabled = true;
                suggestionsContainer.style.display = 'none';
            } else {
                generateBtn.disabled = false;
                suggestionsContainer.style.display = '';
            }
        };
    }

    private generateBrainstormingIdeas(container: HTMLElement): void {
        const ideas = [
            "Consider using a grid layout for better organization",
            "Add visual hierarchy with different font sizes",
            "Use white space to improve readability", 
            "Experiment with color contrast for accessibility",
            "Group related elements closer together",
            "Try asymmetric layouts for dynamic visual interest",
            "Add icons to support textual content",
            "Consider mobile responsiveness",
            "Use consistent spacing between elements",
            "Experiment with different typography combinations"
        ];

        // If selected element is locked, disable brainstorming suggestions
        const selected = this.dc.currentSelection;
        if (selected && (selected as any).locked) {
            container.innerHTML = '<p class="hint-text">Element is locked. Brainstorming disabled.</p>';
            return;
        }
        // Generate 3-5 random ideas
        const selectedIdeas = ideas
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 3);

        container.innerHTML = selectedIdeas
            .map(idea => `
                <div class="suggestion-item">
                    <span class="material-icons">lightbulb_outline</span>
                    <p>${idea}</p>
                </div>
            `)
            .join('');
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

        // Enable by default if checked
        if (adaptiveToggle.checked) {
            this.enableAdaptiveInterface(suggestionsContainer);
        }
    }

    private enableAdaptiveInterface(container: HTMLElement): void {
        // Listen for element selection to show refinement suggestions
        this.dc.onElementSelected = (element) => {
            if (element) {
                this.showRefinementSuggestions(container, element);
            } else {
                this.showDefaultRefinementText(container);
            }
        };
    }

    private disableAdaptiveInterface(container: HTMLElement): void {
        this.dc.onElementSelected = null;
        this.showDefaultRefinementText(container);
    }

    private showRefinementSuggestions(container: HTMLElement, element: any): void {
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
            // Attach click handlers to apply suggestions
            const elems = container.querySelectorAll('.suggestion-item');
            elems.forEach((item, idx) => {
                item.addEventListener('click', () => {
                    suggestions[idx].apply();
                });
            });
        } else {
            container.innerHTML = '<p class="hint-text">No specific suggestions for this element.</p>';
        }
    }

    private showDefaultRefinementText(container: HTMLElement): void {
        container.innerHTML = '<p class="hint-text">Select an element to see AI suggestions for improvements</p>';
    }

    setupElementCallbacks(controlsManager: ControlsManager): void {
        // Setup callbacks for when elements are selected/deselected
        this.dc.onElementSelected = (element) => {
            if (element) {
                controlsManager.updateControlsForElement(element);
                this.autoSaveCallback();
            } else {
                controlsManager.updateControlsForElement(null);
            }

            // Also trigger refinement suggestions if adaptive interface is enabled
            const adaptiveToggle = document.getElementById('adaptive-interface-toggle') as HTMLInputElement;
            const suggestionsContainer = document.querySelector('#left-panel .sidebar-content') as HTMLElement;
            
            if (adaptiveToggle?.checked && suggestionsContainer) {
                if (element && !(element as any).locked) {
                    this.showRefinementSuggestions(suggestionsContainer, element);
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
