// Homepage functionality and template management

import { LayoutElement } from "./core/element";
import { templates } from './config/templates.js';
import { TemplateData } from "./types/template";

/**
 * Manages the homepage functionality including template cards generation,
 * modal handling, and import functionality
 */
class HomePageManager {
    private importModal: HTMLElement | null = null;
    private jsonFileInput: HTMLInputElement | null = null;
    private jsonTextArea: HTMLTextAreaElement | null = null;

    constructor() {
        this.generateTemplateCards();
        this.initializeEventListeners();
        this.setupModal();
    }

    /**
     * Generates template cards in the grid from the templates configuration
     */
    private generateTemplateCards(): void {
        const templateGrid = document.querySelector('.templates-grid');
        if (!templateGrid) {
            console.error('Template grid not found');
            return;
        }

        // Clear existing hardcoded templates
        templateGrid.innerHTML = '';

        // Generate cards from templates config
        Object.entries(templates).forEach(([key, template]) => {
            const templateCard = this.createTemplateCard(key, template);
            templateGrid.appendChild(templateCard);
        });

        // Add blank project card
        const blankCard = this.createBlankProjectCard();
        templateGrid.appendChild(blankCard);
    }

    /**
     * Creates a template card element for a specific template
     * @param key - Template identifier
     * @param template - Template data object
     * @returns HTML element for the template card
     */
    private createTemplateCard(key: string, template: TemplateData): HTMLElement {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.template = key;

        card.innerHTML = `
            <div class="template-info">
                <h4>${template.name}</h4>
                <p>${template.description}</p>
            </div>
        `;

        return card;
    }

    /**
     * Creates a blank project card for starting with empty canvas
     * @returns HTML element for the blank project card
     */
    private createBlankProjectCard(): HTMLElement {
        const card = document.createElement('div');
        card.className = 'template-card blank-project';
        card.dataset.template = 'blank';

        card.innerHTML = `
            <div class="blank-icon">
                <span class="material-icons">add</span>
            </div>
            <div class="template-info">
                <h4>Blank Project</h4>
                <p>Start with an empty canvas</p>
            </div>
        `;

        return card;
    }

    /**
     * Initializes event listeners for template cards and import functionality
     */
    private initializeEventListeners(): void {
        // Template selection event listeners
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = (e.currentTarget as HTMLElement).dataset.template;
                if (template) {
                    this.loadTemplate(template);
                }
            });
        });

        // Import JSON button event listener
        const importBtn = document.getElementById('import-json-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.showImportModal();
            });
        }
    }

    /**
     * Sets up the import modal and its event listeners
     */
    private setupModal(): void {
        this.importModal = document.getElementById('import-modal');
        this.jsonFileInput = document.getElementById('json-file') as HTMLInputElement;
        this.jsonTextArea = document.getElementById('json-text') as HTMLTextAreaElement;

        // Close modal button event listener
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideImportModal();
            });
        }

        // Click outside modal to close
        if (this.importModal) {
            this.importModal.addEventListener('click', (e) => {
                if (e.target === this.importModal) {
                    this.hideImportModal();
                }
            });
        }

        // File input change event listener
        if (this.jsonFileInput) {
            this.jsonFileInput.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
        }

        // Import from text button event listener
        const importFromTextBtn = document.getElementById('import-from-text');
        if (importFromTextBtn) {
            importFromTextBtn.addEventListener('click', () => {
                this.handleTextImport();
            });
        }

        // Handle ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.importModal?.classList.contains('show')) {
                this.hideImportModal();
            }
        });
    }

    /**
     * Loads a template or redirects to editor with template data
     * @param templateKey - The key of the template to load
     */
    private loadTemplate(templateKey: string): void {
        if (templateKey === 'blank') {
            // Redirect to blank canvas
            window.location.href = 'editor.html';
            return;
        }

        const template = templates[templateKey];
        if (template) {
            // Store template data in sessionStorage for editor to use
            sessionStorage.setItem('templateData', JSON.stringify(template));
            
            // Redirect to main app with template parameter
            window.location.href = 'editor.html?template=' + templateKey;
        }
    }

    /**
     * Shows the import modal for JSON file/text import
     */
    private showImportModal(): void {
        if (this.importModal) {
            this.importModal.classList.add('show');
            this.importModal.style.display = 'flex';
            
            // Reset form fields
            if (this.jsonFileInput) this.jsonFileInput.value = '';
            if (this.jsonTextArea) this.jsonTextArea.value = '';
        }
    }

    /**
     * Hides the import modal with animation
     */
    private hideImportModal(): void {
        if (this.importModal) {
            this.importModal.classList.remove('show');
            setTimeout(() => {
                if (this.importModal) {
                    this.importModal.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Handles import from file upload
     * @param event - File input change event
     */
    private async handleFileImport(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file && file.type === 'application/json') {
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                this.importLayout(data);
            } catch (error) {
                alert('Error reading file: ' + (error as Error).message);
            }
        } else {
            alert('Please select a valid JSON file.');
        }
    }

    /**
     * Handles import from text area JSON content
     */
    private handleTextImport(): void {
        if (this.jsonTextArea) {
            const text = this.jsonTextArea.value.trim();
            if (text) {
                try {
                    const data = JSON.parse(text);
                    this.importLayout(data);
                } catch (error) {
                    alert('Invalid JSON format: ' + (error as Error).message);
                }
            } else {
                alert('Please paste JSON content.');
            }
        }
    }

    /**
     * Processes imported layout data and redirects to editor
     * @param data - The imported layout data
     */
    private importLayout(data: any): void {
        try {
            // Validate the data structure
            if (!data.elements || !Array.isArray(data.elements)) {
                throw new Error('Invalid layout format: missing elements array');
            }

            // Store the imported data for editor to use
            sessionStorage.setItem('importedLayout', JSON.stringify(data));
            
            // Redirect to editor with import flag
            window.location.href = 'editor.html?import=true';
            
        } catch (error) {
            alert('Error importing layout: ' + (error as Error).message);
        }
    }
}

// Initialize the home page when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new HomePageManager();
});
