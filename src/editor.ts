// Main application entry point for the DesignScope editor

import { DesignCanvas } from "./core/canvas";
import { LayoutElement } from "./core/element";
import { ControlsManager } from "./managers/ControlsManager";
import { ElementCreationManager } from "./managers/ElementCreationManager";
import { SaveManager } from "./managers/SaveManager";
import { HistoryManager } from "./managers/HistoryManager";
import { UIManager } from "./managers/UIManager";
import APIService from "./services/APIService";
import { templates } from "./config/templates";

// Global flag to track if initial layout has been loaded
let initialLayoutLoaded = false;

// Loads a template directly from the templates configuration
function loadTemplateFromSource(dc: DesignCanvas, templateName: string): boolean {
    try {
        const template = templates[templateName];
        if (template) {
            console.log(`Loading template '${templateName}' directly from source`);
            loadTemplateElements(dc, template.elements, templateName);
            return true;
        } else {
            console.error(`Template '${templateName}' not found in templates config`);
            return false;
        }
    } catch (error) {
        console.error('Error loading template from source:', error);
        return false;
    }
}

// Loads template based on URL parameter
function loadTemplateFromUrl(dc: DesignCanvas): void {
    if (initialLayoutLoaded) {
        console.log('Initial layout already loaded, skipping...');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const templateName = urlParams.get('template');

    console.log('🚀 Loading initial layout...');
    console.log('Template name from URL:', templateName);

    if (templateName && templateName !== 'blank') {
        console.log(`🎨 Loading template: ${templateName}`);
        const success = loadTemplateFromSource(dc, templateName);
        if (success) {
            initialLayoutLoaded = true;
            return;
        }
        console.warn(`⚠️ Failed to load template: ${templateName}`);
    }

    // Check if user wants a blank canvas (no parameters or template=blank)
    const isBlankCanvas = !templateName || templateName === 'blank';
    
    if (isBlankCanvas) {
        console.log('📝 User requested blank canvas, skipping template load');
        initialLayoutLoaded = true;
        return;
    }

    // Only load default layout if template loading failed
    console.warn('⚠️ Loading default layout as fallback');
    initialLayoutLoaded = true;
}

function loadTemplateElements(dc: DesignCanvas, elementsData: any[], templateType: string): void {
    // Clear existing elements first
    dc.clearCanvas();
    
    console.log(`Loading ${templateType} template with ${elementsData.length} elements...`);
    console.log('🎯 Template elements to load:', elementsData);
    
    elementsData.forEach((elementData, index) => {
        console.log(`� Loading element ${index + 1}:`, elementData);
        dc.addElement(new LayoutElement(elementData));
    });
    
    dc.draw();
    dc.saveState();
    console.log(`✅ Template ${templateType} loaded successfully with ${dc.getElements().length} elements`);
}


window.addEventListener("DOMContentLoaded", () => {
    console.log('DesignScape loading...');
    
    const canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Create design canvas
    const dc = new DesignCanvas(canvas);
    console.log('DesignScape loaded successfully');

    // Load template or default layout
    loadTemplateFromUrl(dc);

    // Initialize managers
    const saveManager = new SaveManager(dc);
    const historyManager = new HistoryManager(dc);
    const elementCreationManager = new ElementCreationManager(dc);
    const controlsManager = new ControlsManager(dc, () => saveManager.autoSave());
    const uiManager = new UIManager(dc, () => saveManager.autoSave());

    // Setup UI panels
    uiManager.setupUIPanel();
    uiManager.setupBrainstormingPanel();
    uiManager.setupRefinementSuggestions();
    uiManager.setupElementCallbacks(controlsManager);
    
    console.log('DesignScape ready!');
});