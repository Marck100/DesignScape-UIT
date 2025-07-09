// src/main.ts

import { DesignCanvas } from "./DesignCanvas";
import { LayoutElement, TextAlign } from "./layoutElement";

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
    const dc = new DesignCanvas(canvas);

    // Aggiunta di elementi iniziali come da Fig. 1 del paper
    // Immagini
    const img1 = new Image();
    img1.src = "https://via.placeholder.com/200x150?text=Image+1"; // Placeholder
    img1.onload = () => {
        dc.addElement(new LayoutElement({ x: 100, y: 100, width: 200, height: 150, type: "image", content: img1.src }));
    };

    const img2 = new Image();
    img2.src = "https://via.placeholder.com/200x150?text=Image+2"; // Placeholder
    img2.onload = () => {
        dc.addElement(new LayoutElement({ x: 700, y: 100, width: 200, height: 150, type: "image", content: img2.src }));
    };

    const img3 = new Image();
    img3.src = "https://via.placeholder.com/200x150?text=Image+3"; // Placeholder
    img3.onload = () => {
        dc.addElement(new LayoutElement({ x: 100, y: 400, width: 200, height: 150, type: "image", content: img3.src }));
    };

    const img4 = new Image();
    img4.src = "https://via.placeholder.com/200x150?text=Image+4"; // Placeholder
    img4.onload = () => {
        dc.addElement(new LayoutElement({ x: 700, y: 400, width: 200, height: 150, type: "image", content: img4.src }));
    };


    // Testo
    dc.addElement(new LayoutElement({ x: 350, y: 300, width: 300, height: 30, type: "text", content: "D.P. Jalla Business Institute", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 350, y: 335, width: 300, height: 30, type: "text", content: "University of Kuala Lumpur", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 350, y: 400, width: 300, height: 25, type: "text", content: "Get a Global Perspective", fontSize: 20, fontItalic: true }));

    dc.addElement(new LayoutElement({ x: 700, y: 300, width: 250, height: 30, type: "text", content: "Executive", fontSize: 24, fontBold: true }));
    dc.addElement(new LayoutElement({ x: 700, y: 335, width: 250, height: 30, type: "text", content: "MBA Programs", fontSize: 24, fontBold: true }));

    dc.addElement(new LayoutElement({
        x: 350, y: 450, width: 400, height: 100, type: "text",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tempor eros sed ipsum finibus, ut efficitur nulla feugiat. Integer quis lorem a quam varius gravida. Donec eu ipsum nec lorem pulvinar semper. Fusce eu nibh in enim maximus tincidunt. Ut eget ante ac sem pellentesque dictum et non."
    }));


    const typeSelector = document.getElementById("element-type") as HTMLSelectElement;
    const addButton = document.getElementById("add-element") as HTMLButtonElement;

    const textSettingsPanel = document.getElementById("text-settings-panel")!;
    const fontFamilySelect = document.getElementById("font-family") as HTMLSelectElement;
    const textAlignSelect = document.getElementById("text-align") as HTMLSelectElement;

    const fontSizeInput = document.getElementById("font-size") as HTMLInputElement;
    const fontColorInput = document.getElementById("font-color") as HTMLInputElement;
    const fontBoldCheckbox = document.getElementById("font-bold") as HTMLInputElement;
    const fontItalicCheckbox = document.getElementById("font-italic") as HTMLInputElement;

    addButton.addEventListener("click", () => {
        const type = typeSelector.value;

        let content: string = "";
        if (type === "text") {
            content = prompt("Inserisci il testo:") ?? "";
            if (content === null) return;
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
            type: type as "box" | "text" | "image",
            content
        }));
    });

    const colorPanel = document.getElementById("box-color-panel")!;
    const colorInput = document.getElementById("box-color") as HTMLInputElement;

    dc.onElementSelected = (el) => {
        if (el && el.type === "box") {
            colorInput.value = el.fillColor ?? "#007acc";
            colorPanel.style.display = "block";
            textSettingsPanel.style.display = "none"; // Hide text settings if box is selected
        } else if (el?.type === "text") {
            textSettingsPanel.style.display = "block";
            colorPanel.style.display = "none"; // Hide box color settings if text is selected

            fontFamilySelect.value = el.fontFamily;
            textAlignSelect.value = el.textAlign;
            fontSizeInput.value = el.fontSize.toString();
            fontColorInput.value = el.fontColor;
            fontBoldCheckbox.checked = el.fontBold;
            fontItalicCheckbox.checked = el.fontItalic;
        } else {
            colorPanel.style.display = "none";
            textSettingsPanel.style.display = "none";
        }
    };

    colorInput.addEventListener("input", () => {
        const sel = dc["selectedElement"];
        if (sel && sel.type === "box") {
            sel.fillColor = colorInput.value;
            dc["draw"]();
        }
    });

    function updateSelectedTextElement() {
        const sel = dc["selectedElement"];
        if (sel && sel.type === "text") {
            sel.fontFamily = fontFamilySelect.value;
            sel.textAlign = textAlignSelect.value as TextAlign;
            sel.fontSize = parseInt(fontSizeInput.value);
            sel.fontColor = fontColorInput.value;
            sel.fontBold = fontBoldCheckbox.checked;
            sel.fontItalic = fontItalicCheckbox.checked;

            dc["draw"]();
        }
    }

    fontFamilySelect.addEventListener("change", updateSelectedTextElement);
    textAlignSelect.addEventListener("change", updateSelectedTextElement);
    fontSizeInput.addEventListener("input", updateSelectedTextElement);
    fontColorInput.addEventListener("input", updateSelectedTextElement);
    fontBoldCheckbox.addEventListener("change", updateSelectedTextElement);
    fontItalicCheckbox.addEventListener("change", updateSelectedTextElement);

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
            <div style="text-align: center; padding: 20px;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 10px;">Generando opzioni...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        try {
            const data = await fetchBrainstormingSuggestions();
            const versions = data.versions || [];

            // Mostra le opzioni come bottoni
            brainstormingPanel.innerHTML = `
                <h4 style="color: #555; margin-bottom: 16px; font-weight: 500;">Opzioni generate:</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${versions.map((version: any, index: number) => `
                        <button class="option-btn" data-index="${index}" style="
                            padding: 12px 16px;
                            background-color: #f8f9fa;
                            color: #495057;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s ease;
                            text-align: left;
                        ">
                            ${version.name}
                        </button>
                    `).join("")}
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
                <div style="color: red; text-align: center; padding: 20px;">
                    Errore nel generare le opzioni. Riprova.
                </div>
            `;
        }
    });


});