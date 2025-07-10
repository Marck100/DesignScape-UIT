// src/main.ts

import { DesignCanvas } from "./core/canvas";
import { LayoutElement } from "./core/element";
import { ControlsManager } from "./managers/ControlsManager";
import { ElementCreationManager } from "./managers/ElementCreationManager";
import { SaveManager } from "./managers/SaveManager";
import { HistoryManager } from "./managers/HistoryManager";
import { UIManager } from "./managers/UIManager";

function loadTemplateOrImportedData(dc: DesignCanvas): void {
    const urlParams = new URLSearchParams(window.location.search);
    const isImport = urlParams.get('import') === 'true';
    const templateName = urlParams.get('template');

    if (isImport) {
        // Load imported layout
        const importedData = sessionStorage.getItem('importedLayout');
        if (importedData) {
            try {
                const data = JSON.parse(importedData);
                loadElementsFromData(dc, data.elements);
                sessionStorage.removeItem('importedLayout'); // Clean up
                return;
            } catch (error) {
                console.error('Error loading imported data:', error);
            }
        }
    } else if (templateName) {
        // Load template data
        const templateData = sessionStorage.getItem('templateData');
        if (templateData) {
            try {
                const data = JSON.parse(templateData);
                loadElementsFromData(dc, data.elements);
                sessionStorage.removeItem('templateData'); // Clean up
                return;
            } catch (error) {
                console.error('Error loading template data:', error);
            }
        }
    }

    // Check if user wants a blank canvas (no parameters or template=blank)
    const isBlankCanvas = !templateName || templateName === 'blank';
    
    if (isBlankCanvas) {
        // Just clear the canvas and leave it empty
        dc.clearCanvas();
        dc.draw();
        return;
    }

    // Only load default layout if there was an error or no other option
    loadDefaultLayout(dc);
}

function loadElementsFromData(dc: DesignCanvas, elementsData: any[]): void {
    // Clear existing elements first
    dc.clearCanvas();
    
    elementsData.forEach(elementData => {
        if (elementData.type === "image") {
            const img = new Image();
            img.src = elementData.content;
            img.onload = () => {
                dc.draw(); // Redraw when image loads
            };
            // Add element immediately for layout purposes
            dc.addElement(new LayoutElement(elementData));
        } else {
            dc.addElement(new LayoutElement(elementData));
        }
    });
    
    dc.draw();
    dc.saveState();
}

function loadDefaultLayout(dc: DesignCanvas): void {
    // Aggiunta di elementi iniziali come da Fig. 1 del paper
    // Immagini
    const img1 = new Image();
    img1.src = "https://via.placeholder.com/200x150?text=Image+1"; // Placeholder
    img1.onload = () => {
        dc.addElement(new LayoutElement({ x: 100, y: 100, width: 200, height: 150, type: "image", content: img1.src }));
        dc.draw(); // Force redraw after image load
    };

    const img2 = new Image();
    img2.src = "https://via.placeholder.com/200x150?text=Image+2"; // Placeholder
    img2.onload = () => {
        dc.addElement(new LayoutElement({ x: 700, y: 100, width: 200, height: 150, type: "image", content: img2.src }));
        dc.draw(); // Force redraw after image load
    };

    const img3 = new Image();
    img3.src = "https://via.placeholder.com/200x150?text=Image+3"; // Placeholder
    img3.onload = () => {
        dc.addElement(new LayoutElement({ x: 100, y: 400, width: 200, height: 150, type: "image", content: img3.src }));
        dc.draw(); // Force redraw after image load
    };

    const img4 = new Image();
    img4.src = "https://via.placeholder.com/200x150?text=Image+4"; // Placeholder
    img4.onload = () => {
        dc.addElement(new LayoutElement({ x: 700, y: 400, width: 200, height: 150, type: "image", content: img4.src }));
        dc.draw(); // Force redraw after image load
    };

    // Testo
    console.log('Adding text elements...');
    dc.addElement(new LayoutElement({ x: 350, y: 300, width: 300, height: 30, type: "text", content: "D.P. Jalla Business Institute", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 350, y: 335, width: 300, height: 30, type: "text", content: "University of Kuala Lumpur", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 350, y: 400, width: 300, height: 25, type: "text", content: "Get a Global Perspective", fontSize: 20, fontItalic: true }));

    dc.addElement(new LayoutElement({ x: 700, y: 300, width: 250, height: 30, type: "text", content: "Executive", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 700, y: 335, width: 250, height: 30, type: "text", content: "MBA Programs", fontSize: 24, fontBold: true }));

    dc.addElement(new LayoutElement({
        x: 350, y: 450, width: 400, height: 100, type: "text",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tempor eros sed ipsum finibus, ut efficitur nulla feugiat. Integer quis lorem a quam varius gravida. Donec eu ipsum nec lorem pulvinar semper. Fusce eu nibh in enim maximus tincidunt. Ut eget ante ac sem pellentesque dictum et non."
    }));

    console.log('Total elements after adding text:', dc['elements'].length);

    // Force redraw after adding all initial elements
    dc.draw();
    dc.saveState();
}

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
    const dc = new DesignCanvas(canvas);

    // Load template, imported data, or default layout
    loadTemplateOrImportedData(dc);

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
});