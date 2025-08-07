// src/home.ts

import { LayoutElement } from "./core/element";
import { templates } from "./config/templates";
import { TemplateData } from "./types/template";

class HomePageManager {
    private importModal: HTMLElement | null = null;
    private jsonFileInput: HTMLInputElement | null = null;
    private jsonTextArea: HTMLTextAreaElement | null = null;

    constructor() {
        this.initializeEventListeners();
        this.setupModal();
    }

    private initializeEventListeners(): void {
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = (e.currentTarget as HTMLElement).dataset.template;
                if (template) {
                    this.loadTemplate(template);
                }
            });
        });

        // Import JSON button
        const importBtn = document.getElementById('import-json-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.showImportModal();
            });
        }
    }

    private setupModal(): void {
        this.importModal = document.getElementById('import-modal');
        this.jsonFileInput = document.getElementById('json-file') as HTMLInputElement;
        this.jsonTextArea = document.getElementById('json-text') as HTMLTextAreaElement;

        // Close modal
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideImportModal();
            });
        }

        // Click outside to close
        if (this.importModal) {
            this.importModal.addEventListener('click', (e) => {
                if (e.target === this.importModal) {
                    this.hideImportModal();
                }
            });
        }

        // File input
        if (this.jsonFileInput) {
            this.jsonFileInput.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
        }

        // Import from text button
        const importFromTextBtn = document.getElementById('import-from-text');
        if (importFromTextBtn) {
            importFromTextBtn.addEventListener('click', () => {
                this.handleTextImport();
            });
        }

        // Handle ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.importModal?.classList.contains('show')) {
                this.hideImportModal();
            }
        });
    }

    private loadTemplate(templateKey: string): void {
        if (templateKey === 'blank') {
            // Redirect to blank canvas
            window.location.href = 'editor.html';
            return;
        }

        const template = templates[templateKey];
        if (template) {
            // Store template data in sessionStorage
            sessionStorage.setItem('templateData', JSON.stringify(template));
            
            // Redirect to main app
            window.location.href = 'editor.html?template=' + templateKey;
        }
    }

    private showImportModal(): void {
        if (this.importModal) {
            this.importModal.classList.add('show');
            this.importModal.style.display = 'flex';
            
            // Reset form
            if (this.jsonFileInput) this.jsonFileInput.value = '';
            if (this.jsonTextArea) this.jsonTextArea.value = '';
        }
    }

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

    private importLayout(data: any): void {
        try {
            // Validate the data structure
            if (!data.elements || !Array.isArray(data.elements)) {
                throw new Error('Invalid layout format: missing elements array');
            }

            // Store the imported data
            sessionStorage.setItem('importedLayout', JSON.stringify(data));
            
            // Redirect to main app
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
