// Homepage functionality and template management

import { LayoutElement } from "./core/element";
import { templates } from './config/templates.js';
import { TemplateData } from "./types/template";

/**
 * Manages the homepage functionality including template cards generation,
 * modal handling, and import functionality
 */
class HomePageManager {

    constructor() {
        this.generateTemplateCards();
        this.initializeEventListeners();
    }

    // Generates template cards in the grid from the templates configuration
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

    // Creates a template card element for a specific template
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

    // Creates a blank project card for starting with empty canvas
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

    // Initializes event listeners for template cards and import functionality
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
            window.location.href = 'editor.html?template=' + templateKey;
        }
    }

}

// Initialize the home page when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new HomePageManager();
});
