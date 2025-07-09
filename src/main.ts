// src/main.ts

import { DesignCanvas } from "./DesignCanvas";
import { LayoutElement, TextAlign } from "./layoutElement";
import { generateRefinementSuggestions } from "./refinementSuggestion";

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

    // Dropdown element menu
    const addElementBtn = document.getElementById('add-element-btn') as HTMLButtonElement;
    const dropdownContainer = addElementBtn?.parentElement as HTMLElement;
    const elementDropdown = document.getElementById('element-dropdown') as HTMLElement;
    const dropdownItems = document.querySelectorAll('.dropdown-item') as NodeListOf<HTMLButtonElement>;

    // Properties toolbar elements (fixed top bar)
    const propertiesToolbar = document.getElementById("properties-toolbar")!;
    const boxProperties = document.getElementById("box-properties")!;
    const textProperties = document.getElementById("text-properties")!;
    const emptyProperties = document.getElementById("empty-properties")!;
    
    // Box controls
    const boxXInput = document.getElementById("box-x") as HTMLInputElement;
    const boxYInput = document.getElementById("box-y") as HTMLInputElement;
    const boxWidthInput = document.getElementById("box-width") as HTMLInputElement;
    const boxHeightInput = document.getElementById("box-height") as HTMLInputElement;
    const boxColorInput = document.getElementById("box-color") as HTMLInputElement;
    
    // Text controls
    const textXInput = document.getElementById("text-x") as HTMLInputElement;
    const textYInput = document.getElementById("text-y") as HTMLInputElement;
    const textWidthInput = document.getElementById("text-width") as HTMLInputElement;
    const textHeightInput = document.getElementById("text-height") as HTMLInputElement;
    const fontFamilySelect = document.getElementById("font-family") as HTMLSelectElement;
    const fontSizeInput = document.getElementById("font-size") as HTMLInputElement;
    const fontColorInput = document.getElementById("font-color") as HTMLInputElement;
    
    // Text alignment and style buttons
    const alignButtons = document.querySelectorAll('.toolbar-btn[data-align]');
    const boldBtn = document.getElementById("font-bold-btn") as HTMLButtonElement;
    const italicBtn = document.getElementById("font-italic-btn") as HTMLButtonElement;

    // Dropdown toggle functionality
    addElementBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContainer?.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownContainer?.contains(e.target as Node)) {
            dropdownContainer?.classList.remove('open');
        }
    });

    // Dropdown items event handlers
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close dropdown
            dropdownContainer?.classList.remove('open');
            
            // Get element type from data attribute
            const type = item.dataset.element as "box" | "text" | "image";
            
            // Create element immediately
            let content: string = "";
            if (type === "text") {
                content = prompt("Inserisci il testo:") ?? "";
                if (content === null || content.trim() === "") return;
            }
            if (type === "image") {
                content = prompt("Inserisci URL immagine:") ?? "";
                if (!content || content.trim() === "") return;
            }

            dc.addElement(new LayoutElement({
                x: 200,
                y: 200,
                width: type === "text" ? 200 : 150,
                height: type === "text" ? 40 : 100,
                type: type,
                content
            }));
        });
    });

    const colorPanel = document.getElementById("box-color-panel");
    const colorInput = document.getElementById("box-color") as HTMLInputElement;

    // Text alignment and style handlers
    let currentTextAlign: TextAlign = 'left';
    let currentFontBold = false;
    let currentFontItalic = false;
    
    // Setup alignment buttons
    alignButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            alignButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTextAlign = btn.getAttribute('data-align') as TextAlign;
            updateSelectedTextElement();
        });
    });
    
    // Setup style buttons
    boldBtn.addEventListener('click', () => {
        currentFontBold = !currentFontBold;
        boldBtn.classList.toggle('active', currentFontBold);
        updateSelectedTextElement();
    });
    
    italicBtn.addEventListener('click', () => {
        currentFontItalic = !currentFontItalic;
        italicBtn.classList.toggle('active', currentFontItalic);
        updateSelectedTextElement();
    });

    boxColorInput.addEventListener("input", () => {
        const sel = dc.currentSelection;
        if (sel && sel.type === "box") {
            sel.fillColor = boxColorInput.value;
            dc.draw();
            dc.saveState(); // Save state after property change
            autoSave();
        }
    });

    // Box position and dimension controls
    function updateSelectedBoxElement() {
        const sel = dc.currentSelection;
        console.log('updateSelectedBoxElement called, sel:', sel);
        if (sel && sel.type === "box") {
            const newX = snapToGrid(parseInt(boxXInput.value) || 0);
            const newY = snapToGrid(parseInt(boxYInput.value) || 0);
            const newWidth = validateDimension(parseInt(boxWidthInput.value) || 50, 20);
            const newHeight = validateDimension(parseInt(boxHeightInput.value) || 50, 20);
            
            sel.x = newX;
            sel.y = newY;
            sel.width = newWidth;
            sel.height = newHeight;
            
            // Update inputs to show corrected values
            boxXInput.value = sel.x.toString();
            boxYInput.value = sel.y.toString();
            boxWidthInput.value = sel.width.toString();
            boxHeightInput.value = sel.height.toString();

            console.log('Updated box element:', sel);
            dc.draw();
            dc.saveState();
            autoSave();
        }
    }

    // I listener di change e blur sono gestiti nell'array qui sotto per evitare duplicati
    
    // Supporto per Invio e arrow keys su tutti i controlli numerici dei box
    [boxXInput, boxYInput, boxWidthInput, boxHeightInput].forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur(); // Trigger the blur event
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault(); // Prevent default increment
                handleCustomIncrement(input, e.key === "ArrowUp" ? 1 : -1, input === boxWidthInput || input === boxHeightInput);
            }
        });
        
        // NON intercettiamo input - lasciamo che i pulsantini funzionino nativamente
        // Correggiamo solo quando l'utente ha finito (blur o change)
        input.addEventListener("change", () => {
            console.log("Change event triggered on:", input.id, "new value:", input.value);
            
            const currentValue = parseInt(input.value) || 0;
            const isDimension = input === boxWidthInput || input === boxHeightInput;
            
            let correctedValue: number;
            if (isDimension) {
                correctedValue = validateDimension(currentValue, 20);
            } else {
                correctedValue = snapToGrid(currentValue);
            }
            
            // Solo correggi se il valore è diverso
            if (correctedValue !== currentValue) {
                console.log("Correcting value from", currentValue, "to", correctedValue);
                input.value = correctedValue.toString();
            }
            
            // Aggiorna sempre l'elemento
            updateSelectedBoxElement();
        });
        
        // Aggiungi anche blur per quando l'utente clicca fuori
        input.addEventListener("blur", () => {
            console.log("Blur event triggered on:", input.id);
            // Scatena change se non è già stato scatenato
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    // Text position and dimension controls
    function updateSelectedTextElement() {
        const sel = dc.currentSelection;
        console.log('updateSelectedTextElement called, sel:', sel);
        if (sel && sel.type === "text") {
            // Always update all properties - simpler logic
            const newX = snapToGrid(parseInt(textXInput.value) || 0);
            const newY = snapToGrid(parseInt(textYInput.value) || 0);
            const newWidth = validateDimension(parseInt(textWidthInput.value) || 100, 40);
            const newHeight = validateDimension(parseInt(textHeightInput.value) || 30, 20);
            
            sel.x = newX;
            sel.y = newY;
            sel.width = newWidth;
            sel.height = newHeight;
            
            // Update inputs to show corrected values
            textXInput.value = sel.x.toString();
            textYInput.value = sel.y.toString();
            textWidthInput.value = sel.width.toString();
            textHeightInput.value = sel.height.toString();
            
            // Update text properties
            sel.fontFamily = fontFamilySelect.value;
            sel.textAlign = currentTextAlign;
            sel.fontSize = Math.max(8, Math.min(72, parseInt(fontSizeInput.value) || 20));
            sel.fontColor = fontColorInput.value;
            sel.fontBold = currentFontBold;
            sel.fontItalic = currentFontItalic;
            
            // Update font size input to show corrected value
            fontSizeInput.value = sel.fontSize.toString();

            console.log('Updated element:', sel);
            dc.draw();
            dc.saveState();
            autoSave();
        }
    }

    // Helper function for grid snapping - gestisce anche valori negativi
    function snapToGrid(value: number, gridSize: number = 20): number {
        if (isNaN(value)) return 0;
        return Math.round(value / gridSize) * gridSize;
    }
    
    // Helper function per validare dimensioni minime
    function validateDimension(value: number, minValue: number, gridSize: number = 20): number {
        const snapped = snapToGrid(value, gridSize);
        return Math.max(minValue, snapped);
    }
    
    // Gestione incremento personalizzato per rispettare la griglia
    function handleCustomIncrement(input: HTMLInputElement, direction: number, isDimension: boolean = false) {
        const currentValue = parseInt(input.value) || 0;
        const gridSize = 20;
        let newValue: number;
        
        if (isDimension) {
            // Per dimensioni, incrementa/decrementa di 20px (gridSize) rispettando il minimo
            const minValue = input === boxWidthInput || input === boxHeightInput ? 20 : 
                            input === textWidthInput ? 40 : 20;
            newValue = Math.max(minValue, currentValue + (direction * gridSize));
        } else {
            // Per posizioni, incrementa/decrementa di 20px (gridSize)
            newValue = currentValue + (direction * gridSize);
        }
        
        input.value = newValue.toString();
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    fontFamilySelect.addEventListener("change", updateSelectedTextElement);
    fontColorInput.addEventListener("input", updateSelectedTextElement);
    
    // I listener per i controlli numerici sono gestiti nell'array qui sotto per evitare duplicati
    
    // Supporto per Invio e arrow keys su tutti i controlli numerici del testo
    [textXInput, textYInput, textWidthInput, textHeightInput, fontSizeInput].forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur(); // Trigger the blur event
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault(); // Prevent default increment
                
                if (input === fontSizeInput) {
                    // Font size: incrementa di 2px
                    const currentValue = parseInt(input.value) || 20;
                    const newValue = Math.max(8, Math.min(72, currentValue + (e.key === "ArrowUp" ? 2 : -2)));
                    input.value = newValue.toString();
                } else {
                    // Posizione e dimensioni: incrementa di 20px (griglia)
                    handleCustomIncrement(input, e.key === "ArrowUp" ? 1 : -1, input === textWidthInput || input === textHeightInput);
                }
                
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // NON intercettiamo input - lasciamo che i pulsantini funzionino nativamente
        // Correggiamo solo quando l'utente ha finito (blur o change)
        input.addEventListener("change", () => {
            console.log("Change event triggered on:", input.id, "new value:", input.value);
            
            const currentValue = parseInt(input.value) || 0;
            let correctedValue: number;
            
            if (input === fontSizeInput) {
                // Font size: range 8-72, incremento di 2
                correctedValue = Math.max(8, Math.min(72, Math.round(currentValue / 2) * 2));
            } else if (input === textWidthInput || input === textHeightInput) {
                // Dimensioni testo: snap alla griglia con minimo
                const minValue = input === textWidthInput ? 40 : 20;
                correctedValue = validateDimension(currentValue, minValue);
            } else {
                // Posizioni: snap alla griglia
                correctedValue = snapToGrid(currentValue);
            }
            
            // Solo correggi se il valore è diverso
            if (correctedValue !== currentValue) {
                console.log("Correcting value from", currentValue, "to", correctedValue);
                input.value = correctedValue.toString();
            }
            
            // Aggiorna sempre l'elemento
            updateSelectedTextElement();
        });
        
        // Aggiungi anche blur per quando l'utente clicca fuori
        input.addEventListener("blur", () => {
            console.log("Blur event triggered on:", input.id);
            // Scatena change se non è già stato scatenato
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    async function fetchBrainstormingSuggestions() {
        const layout = dc.exportLayout();
        console.log('layout:', layout);
        const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ input: layout })
        });

        const data = await response.json();
        console.log('DATA:', data)
        console.log(data.output)
        return data;
    }

    const brainstormingPanel = document.getElementById("brainstorming-suggestions")!;
    const button = document.getElementById("generate-brainstorming")!;

    button.addEventListener("click", async () => {
        // Mostra rotella di caricamento
        brainstormingPanel.innerHTML = `
            <div style="text-align: center; padding: 32px 20px;">
                <div style="
                    border: 3px solid #e2e8f0; 
                    border-top: 3px solid #667eea; 
                    border-radius: 50%; 
                    width: 32px; 
                    height: 32px; 
                    animation: spin 1s linear infinite; 
                    margin: 0 auto 16px auto;
                "></div>
                <p style="color: #6b7280; font-size: 14px; font-weight: 500;">Generating creative options...</p>
            </div>
        `;

        try {
            const data = await fetchBrainstormingSuggestions();
            const versions = data.versions || [];

            // Mostra le opzioni come bottoni
            brainstormingPanel.innerHTML = `
                <h4 style="color: #374151; margin-bottom: 16px; font-weight: 600; font-size: 14px;">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">palette</span>
                    Creative Options
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${versions.map((version: any, index: number) => `
                        <button class="option-btn" data-index="${index}" style="
                            padding: 12px 16px;
                            background-color: #f8fafc;
                            color: #4a5568;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s ease;
                            text-align: left;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <span class="material-icons" style="font-size: 16px; color: #667eea;">auto_awesome</span>
                            ${version.name}
                        </button>
                    `).join("")}
                </div>
                <div style="
                    margin-top: 16px; 
                    padding: 12px; 
                    background: #f0f9ff; 
                    border-radius: 6px; 
                    border-left: 3px solid #0ea5e9;
                ">
                    <p style="font-size: 12px; color: #0369a1; line-height: 1.4;">
                        <strong>Tip:</strong> Click any option to apply it to your canvas. Each style offers a different creative approach.
                    </p>
                </div>
            `;

            // Aggiungi event listeners per i bottoni delle opzioni
            brainstormingPanel.querySelectorAll('.option-btn').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    dc.clear();
                    const selectedVersion = versions[index];
                    selectedVersion.layout.forEach((el: any) => {
                        dc.addElement(new LayoutElement(el));
                    });
                });

                // Effetto hover
                btn.addEventListener('mouseenter', () => {
                    (btn as HTMLElement).style.backgroundColor = '#e9ecef';
                    (btn as HTMLElement).style.borderColor = '#6c757d';
                });
                btn.addEventListener('mouseleave', () => {
                    (btn as HTMLElement).style.backgroundColor = '#f8f9fa';
                    (btn as HTMLElement).style.borderColor = '#dee2e6';
                });
            });

        } catch (error) {
            brainstormingPanel.innerHTML = `
                <div style="
                    background: #fef2f2; 
                    border: 1px solid #fecaca; 
                    border-radius: 8px; 
                    padding: 16px; 
                    text-align: center;
                    margin-top: 16px;
                ">
                    <div style="color: #dc2626; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
                        <span class="material-icons" style="vertical-align: middle; margin-right: 4px; font-size: 16px;">error</span>
                        Generation Failed
                    </div>
                    <p style="color: #7f1d1d; font-size: 13px;">Unable to generate options. Please check your connection and try again.</p>
                    <button onclick="document.getElementById('generate-brainstorming').click()" style="
                        margin-top: 12px;
                        padding: 6px 12px;
                        background: #dc2626;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            `;
        }
    });

    // Header functionality
    const saveBtn = document.getElementById("save-project");
    const exportBtn = document.getElementById("export-project");

    saveBtn?.addEventListener("click", () => {
        const layout = dc.exportLayout();
        const dataStr = JSON.stringify(layout, null, 2);
        localStorage.setItem('designscope-project', dataStr);
        
        // Show feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="material-icons">check</span>Saved!';
        saveBtn.style.background = '#10b981';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 2000);
    });

    exportBtn?.addEventListener("click", () => {
        const layout = dc.exportLayout();
        const dataStr = JSON.stringify(layout, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "designscope-layout.json";
        a.click();
        URL.revokeObjectURL(url);
        
        // Show feedback
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<span class="material-icons">check</span>Exported!';
        exportBtn.style.background = '#10b981';
        setTimeout(() => {
            exportBtn.innerHTML = originalText;
            exportBtn.style.background = '';
        }, 2000);
    });

    // Undo/Redo functionality
    const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement;
    const redoBtn = document.getElementById("redo-btn") as HTMLButtonElement;

    // Set up history change callback
    dc.onHistoryChange = (canUndo: boolean, canRedo: boolean) => {
        undoBtn.disabled = !canUndo;
        redoBtn.disabled = !canRedo;
    };

    undoBtn?.addEventListener("click", () => {
        if (dc.undo()) {
            // Show feedback
            const originalText = undoBtn.innerHTML;
            undoBtn.innerHTML = '<span class="material-icons">check</span>';
            setTimeout(() => {
                undoBtn.innerHTML = originalText;
            }, 500);
        }
    });

    redoBtn?.addEventListener("click", () => {
        if (dc.redo()) {
            // Show feedback
            const originalText = redoBtn.innerHTML;
            redoBtn.innerHTML = '<span class="material-icons">check</span>';
            setTimeout(() => {
                redoBtn.innerHTML = originalText;
            }, 500);
        }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // Undo: Ctrl+Z (or Cmd+Z on Mac)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (dc.canUndo()) {
                dc.undo();
            }
        }
        
        // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Y/Cmd+Shift+Z on Mac)
        if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
            e.preventDefault();
            if (dc.canRedo()) {
                dc.redo();
            }
        }
    });

    // Keyboard shortcuts for element creation
    document.addEventListener('keydown', (e) => {
        // Only trigger if no input is focused
        if (document.activeElement?.tagName === 'INPUT' || 
            document.activeElement?.tagName === 'TEXTAREA' ||
            document.activeElement?.tagName === 'SELECT') {
            return;
        }

        let elementType: "box" | "text" | "image" | null = null;
        
        switch (e.key.toLowerCase()) {
            case 'r':
                elementType = 'box';
                break;
            case 't':
                elementType = 'text';
                break;
            case 'i':
                elementType = 'image';
                break;
        }

        if (elementType) {
            e.preventDefault();
            
            let content: string = "";
            if (elementType === "text") {
                content = prompt("Inserisci il testo:") ?? "";
                if (content === null || content.trim() === "") return;
            }
            if (elementType === "image") {
                content = prompt("Inserisci URL immagine:") ?? "";
                if (!content || content.trim() === "") return;
            }

            dc.addElement(new LayoutElement({
                x: 200,
                y: 200,
                width: elementType === "text" ? 200 : 150,
                height: elementType === "text" ? 40 : 100,
                type: elementType,
                content
            }));
        }
    });
    
    // Auto-save functionality
    let autoSaveTimer: number;
    function autoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = window.setTimeout(() => {
            const layout = dc.exportLayout();
            localStorage.setItem('designscope-autosave', JSON.stringify(layout));
        }, 5000);
    }

    // Load saved project if exists
    const savedProject = localStorage.getItem('designscope-project');
    if (savedProject) {
        try {
            const layout = JSON.parse(savedProject);
            // Could add a confirmation dialog here
        } catch (e) {
            console.warn('Could not load saved project:', e);
        }
    }

    // Function to show refinement suggestions
    function showRefinementSuggestions(selectedElement: LayoutElement | null) {
        const leftSidebar = document.querySelector('#left-panel .sidebar-content') as HTMLElement;
        
        if (!selectedElement) {
            leftSidebar.innerHTML = `
                <p class="hint-text">Select an element to see AI suggestions for improvements</p>
            `;
            return;
        }

        // Generate suggestions for the selected element
        const suggestions = generateRefinementSuggestions(
            selectedElement,
            dc["elements"],
            dc["canvas"].width,
            dc["canvas"].height,
            () => {
                dc.draw();
                dc.saveState();
                autoSave();
            }
        );

        if (suggestions.length === 0) {
            leftSidebar.innerHTML = `<p class="hint-text">No refinement suggestions available for this element</p>`;
            return;
        }

        // Display suggestions
        leftSidebar.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h4 style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                    <span class="material-icons" style="font-size: 16px; color: #667eea;">psychology</span>
                    AI Layout Refinements
                </h4>
                <p style="color: #6b7280; font-size: 12px; line-height: 1.4; margin-bottom: 16px;">
                    Based on energy optimization (alignment, overlap, symmetry, whitespace):
                </p>
            </div>
            <div class="suggestions-list">
                ${suggestions.map((suggestion, index) => `
                    <div class="suggestion-item" style="
                        padding: 12px;
                        margin-bottom: 8px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 13px;
                        line-height: 1.4;
                    " data-index="${index}">
                        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 4px;">
                            <span style="font-weight: 500; color: #374151;">
                                � Energy Score: +${suggestion.energyImprovement.toFixed(1)}
                            </span>
                        </div>
                        <div style="color: #6b7280;">
                            ${suggestion.description}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="
                margin-top: 16px; 
                padding: 12px; 
                background: #f0f9ff; 
                border-radius: 6px; 
                border-left: 3px solid #0ea5e9;
            ">
                <p style="font-size: 11px; color: #0369a1; line-height: 1.3;">
                    <strong>Energy Model:</strong> Higher scores = better layout improvements according to design principles (alignment, symmetry, overlap avoidance).
                </p>
            </div>
        `;

        // Add event listeners for suggestion items
        leftSidebar.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                suggestions[index].apply();
                showRefinementSuggestions(selectedElement); // Refresh suggestions
            });

            // Hover effects
            item.addEventListener('mouseenter', () => {
                (item as HTMLElement).style.backgroundColor = '#edf2f7';
                (item as HTMLElement).style.borderColor = '#667eea';
                (item as HTMLElement).style.transform = 'translateY(-1px)';
            });
            
            item.addEventListener('mouseleave', () => {
                (item as HTMLElement).style.backgroundColor = '#f8fafc';
                (item as HTMLElement).style.borderColor = '#e2e8f0';
                (item as HTMLElement).style.transform = 'translateY(0)';
            });
        });
    }

    // Adaptive Interface functionality
    const adaptiveToggle = document.getElementById("adaptive-interface-toggle") as HTMLInputElement;
    
    let isAdaptiveMode = true;
    let adaptiveTimeout: number;
    
    function applyAdaptiveRefinements() {
        if (!isAdaptiveMode || !dc["selectedElement"]) return;
        
        const selectedElement = dc["selectedElement"];
        const suggestions = generateRefinementSuggestions(
            selectedElement,
            dc["elements"],
            dc["canvas"].width,
            dc["canvas"].height,
            () => {
                dc.draw();
                dc.saveState();
                autoSave();
            }
        );
        
        // In adaptive mode, automatically apply the most conservative (first) suggestion
        if (suggestions.length > 0) {
            // Apply the first (most conservative) suggestion automatically after a small delay
            clearTimeout(adaptiveTimeout);
            adaptiveTimeout = window.setTimeout(() => {
                suggestions[0].apply();
                // Show brief feedback that adaptive refinement was applied
                showAdaptiveFeedback();
            }, 500); // 500ms delay to avoid constant adjustments while dragging
        }
    }
    
    function showAdaptiveFeedback() {
        const canvas = dc["canvas"];
        const ctx = canvas.getContext('2d')!;
        
        // Show a brief "auto-refined" indicator
        ctx.save();
        ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('✨ Auto-refined', canvas.width - 100, 20);
        ctx.restore();
        
        // Remove the indicator after 1 second
        setTimeout(() => {
            dc.draw();
        }, 1000);
    }
    
    adaptiveToggle.addEventListener('change', () => {
        isAdaptiveMode = adaptiveToggle.checked;
        clearTimeout(adaptiveTimeout);
        
        // Save preference
        localStorage.setItem('designscope-adaptive-mode', isAdaptiveMode.toString());
        
        // Show feedback
        const label = document.querySelector('.toggle-label') as HTMLElement;
        const originalText = label.textContent;
        label.textContent = isAdaptiveMode ? 'Auto-refine: ON' : 'Auto-refine: OFF';
        label.style.color = isAdaptiveMode ? '#10b981' : '#ef4444';
        
        setTimeout(() => {
            label.textContent = originalText;
            label.style.color = '';
        }, 2000);
    });
    
    // Load adaptive mode preference
    const savedAdaptiveMode = localStorage.getItem('designscope-adaptive-mode');
    if (savedAdaptiveMode !== null) {
        isAdaptiveMode = savedAdaptiveMode === 'true';
        adaptiveToggle.checked = isAdaptiveMode;
    }
    
    // Update interface on element selection
    dc.onElementSelected = (el) => {
        // Always show the toolbar, but change content based on selection
        if (el) {
            emptyProperties.style.display = "none";
            
            if (el.type === "box") {
                // Update box controls
                boxXInput.value = el.x.toString();
                boxYInput.value = el.y.toString();
                boxWidthInput.value = el.width.toString();
                boxHeightInput.value = el.height.toString();
                boxColorInput.value = el.fillColor ?? "#007acc";
                
                boxProperties.style.display = "flex";
                textProperties.style.display = "none";
            } else if (el.type === "text") {
                // Update text controls
                textXInput.value = el.x.toString();
                textYInput.value = el.y.toString();
                textWidthInput.value = el.width.toString();
                textHeightInput.value = el.height.toString();
                fontFamilySelect.value = el.fontFamily;
                fontSizeInput.value = el.fontSize.toString();
                fontColorInput.value = el.fontColor;
                
                boxProperties.style.display = "none";
                textProperties.style.display = "flex";
                
                // Update alignment buttons
                alignButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-align') === el.textAlign);
                });
                currentTextAlign = el.textAlign;
                
                // Update style buttons
                currentFontBold = el.fontBold;
                currentFontItalic = el.fontItalic;
                boldBtn.classList.toggle('active', currentFontBold);
                italicBtn.classList.toggle('active', currentFontItalic);
            }
        } else {
            // Show empty state
            boxProperties.style.display = "none";
            textProperties.style.display = "none";
            emptyProperties.style.display = "flex";
        }
        
        // Show refinement suggestions when element is selected (always visible for manual use)
        showRefinementSuggestions(el);
        
        // Trigger auto-save when element is selected
        autoSave();
    };
    // Set up adaptive mode callback for when elements are moved/resized
    dc.onElementMoved = (el) => {
        if (isAdaptiveMode && el) {
            applyAdaptiveRefinements();
        }
    };
    
    // Update controls when element is updated via mouse interaction
    dc.onElementUpdated = (el) => {
        if (el.type === "box") {
            boxXInput.value = el.x.toString();
            boxYInput.value = el.y.toString();
            boxWidthInput.value = el.width.toString();
            boxHeightInput.value = el.height.toString();
        } else if (el.type === "text") {
            textXInput.value = el.x.toString();
            textYInput.value = el.y.toString();
            textWidthInput.value = el.width.toString();
            textHeightInput.value = el.height.toString();
        }
    };
    
    // Initial interface setup
    console.log('DesignScope initialized with adaptive interface:', isAdaptiveMode);

});