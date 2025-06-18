// src/brainstormingSuggestion.ts

import { LayoutElement } from "./layoutElement";

export interface BrainstormingSuggestion {
    id: string; // Un ID univoco per il suggerimento
    description: string;
    apply: (elements: LayoutElement[], canvasWidth: number, canvasHeight: number) => LayoutElement[];
    // apply ora riceve tutti gli elementi e le dimensioni del canvas per generare un nuovo set di elementi
    // e restituisce un *nuovo* array di LayoutElement (o elementi con nuove posizioni/dimensioni)
}

function areOverlapping(a: LayoutElement, b: LayoutElement): boolean {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Genera un array di Brainstorming Suggestions basandosi su diverse strategie di layout.
 * @param originalElements Gli elementi attuali sul canvas.
 * @param canvasWidth Larghezza del canvas.
 * @param canvasHeight Altezza del canvas.
 * @returns Un array di BrainstormingSuggestion.
 */
export function generateBrainstormingSuggestions(
    originalElements: LayoutElement[],
    canvasWidth: number,
    canvasHeight: number
): BrainstormingSuggestion[] {
    const suggestions: BrainstormingSuggestion[] = [];

    // Ottieni un contesto canvas temporaneo per misurare il testo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Funzione helper per misurare l'altezza del testo con word-wrapping
    // Accetta ctx che può essere null
    const measureTextHeight = (element: LayoutElement, ctx: CanvasRenderingContext2D | null, maxWidth: number): number => {
        if (!element.content) return element.fontSize * 1.2; // Fallback

        if (!ctx) {
            // Fallback se il contesto non è disponibile
            return element.fontSize * 1.5;
        }

        ctx.font = `${element.fontItalic ? 'italic ' : ''}${element.fontBold ? 'bold ' : ''}${element.fontSize}px ${element.fontFamily}`;
        const words = element.content.split(/\s+/);
        let line = "";
        let linesCount = 0;
        const lineHeight = element.fontSize * 1.2;

        for (let n = 0; n < words.length; n++) {
            const testLine = line === "" ? words[n] : line + " " + words[n];
            if (ctx.measureText(testLine).width > maxWidth) {
                linesCount++;
                line = words[n];
            } else {
                line = testLine;
            }
        }
        if (line !== "") linesCount++;
        return linesCount * lineHeight;
    };


    // --- Esempio 1: Layout a griglia semplice (distribuzione uniforme) ---
    suggestions.push({
        id: "grid-layout",
        description: "Layout a Griglia Uniforme",
        apply: (elements: LayoutElement[], width: number, height: number): LayoutElement[] => {
            const newElements: LayoutElement[] = [];
            const numCols = Math.ceil(Math.sqrt(elements.length));
            const numRows = Math.ceil(elements.length / numCols);
            const cellWidth = width / numCols;
            const cellHeight = height / numRows;

            elements.forEach((el, i) => {
                const col = i % numCols;
                const row = Math.floor(i / numCols);

                // Crea una copia dell'elemento per non modificare l'originale prima dell'applicazione
                const newEl = new LayoutElement({ ...el });
                newEl.x = col * cellWidth + (cellWidth - newEl.width) / 2; // Centra nella cella
                newEl.y = row * cellHeight + (cellHeight - newEl.height) / 2; // Centra nella cella

                // Assicurati che le dimensioni siano all'interno dei limiti della cella
                newEl.width = Math.min(newEl.width, cellWidth * 0.9);
                newEl.height = Math.min(newEl.height, cellHeight * 0.9);

                // Aggiusta l'altezza del testo se il width è cambiato
                if (newEl.type === "text" && newEl.content) {
                    newEl.height = measureTextHeight(newEl, tempCtx, newEl.width);
                }

                newElements.push(newEl);
            });
            return newElements;
        },
    });

    // --- Esempio 2: Layout con focus centrale (elemento più grande al centro, altri attorno) ---
    if (originalElements.length > 0) {
        suggestions.push({
            id: "center-focus-layout",
            description: "Layout con Focus Centrale",
            apply: (elements: LayoutElement[], width: number, height: number): LayoutElement[] => {
                const newElements: LayoutElement[] = [];
                // Trova l'elemento più grande (o il primo) per metterlo al centro
                const centralElementIndex = 0; // Potresti volerlo rendere più intelligente
                const centralEl = new LayoutElement({ ...elements[centralElementIndex] });

                centralEl.width = Math.min(width * 0.6, centralEl.width * 1.5); // Aumenta leggermente la dimensione
                centralEl.height = Math.min(height * 0.6, centralEl.height * 1.5);

                // Aggiorna l'altezza del testo se il width è cambiato
                if (centralEl.type === "text" && centralEl.content) {
                    centralEl.height = measureTextHeight(centralEl, tempCtx, centralEl.width);
                }

                centralEl.x = (width - centralEl.width) / 2;
                centralEl.y = (height - centralEl.height) / 2;
                newElements.push(centralEl);

                const radialDistance = Math.min(width, height) * 0.2; // Distanza radiale per gli altri elementi
                const angleStep = (2 * Math.PI) / (elements.length - 1);

                elements.forEach((el, i) => {
                    if (i === centralElementIndex) return;

                    const newEl = new LayoutElement({ ...el });
                    const angle = (i - (i > centralElementIndex ? 1 : 0)) * angleStep; // Distribuisci attorno

                    newEl.x = centralEl.x + centralEl.width / 2 + radialDistance * Math.cos(angle) - newEl.width / 2;
                    newEl.y = centralEl.y + centralEl.height / 2 + radialDistance * Math.sin(angle) - newEl.height / 2;

                    // Assicurati che gli elementi rimangano nel canvas
                    newEl.x = Math.max(0, Math.min(newEl.x, width - newEl.width));
                    newEl.y = Math.max(0, Math.min(newEl.y, height - newEl.height));

                    // Aggiusta l'altezza del testo se il width è cambiato
                    if (newEl.type === "text" && newEl.content) {
                        newEl.height = measureTextHeight(newEl, tempCtx, newEl.width);
                    }

                    newElements.push(newEl);
                });
                return newElements;
            },
        });
    }

    // --- Esempio 3: Layout a colonna singola (per contenuti testuali, o simili) ---
    suggestions.push({
        id: "single-column-layout",
        description: "Layout a Colonna Singola",
        apply: (elements: LayoutElement[], width: number, height: number): LayoutElement[] => {
            const newElements: LayoutElement[] = [];
            const padding = 50;
            let currentY = padding;

            // Ordina gli elementi per tipo (es. testo prima, poi immagini, poi box) o altezza
            const sortedElements = [...elements].sort((a, b) => {
                if (a.type === "text" && b.type !== "text") return -1;
                if (a.type !== "text" && b.type === "text") return 1;
                return a.y - b.y; // Mantieni l'ordine verticale originale se dello stesso tipo
            });

            sortedElements.forEach(el => {
                const newEl = new LayoutElement({ ...el });
                newEl.width = width - 2 * padding; // Occupa la larghezza del canvas meno padding
                newEl.x = padding;
                newEl.y = currentY;

                // Aggiorna l'altezza se è un testo per adattarsi al nuovo width
                if (newEl.type === "text" && newEl.content) {
                    newEl.height = measureTextHeight(newEl, tempCtx, newEl.width);
                } else {
                    // Scala altezza proporzionalmente, ma limita per non essere troppo grande
                    newEl.height = newEl.height * (newEl.width / el.width);
                    newEl.height = Math.min(newEl.height, height / 3);
                }

                newElements.push(newEl);
                currentY += newEl.height + 20; // Spazio tra gli elementi
                if (currentY > height - padding) {
                    // Se superiamo l'altezza del canvas, non aggiungere più elementi
                    // Potresti voler ridimensionare o creare una scrollbar in un'applicazione reale
                    const lastEl = newElements[newElements.length - 1];
                    if (lastEl) {
                        lastEl.height = height - padding - lastEl.y - 10; // Taglia l'ultimo elemento per adattarsi
                        if (lastEl.height < 20) newElements.pop(); // Rimuovi se troppo piccolo
                    }
                    return; // Esci dal forEach
                }
            });
            return newElements;
        },
    });

    // Aggiungi altri tipi di suggerimenti di brainstorming qui (es. a due colonne, con intestazione grande, ecc.)
    // Ogni suggerimento deve implementare la logica per riposizionare e/o ridimensionare *tutti* gli elementi

    return suggestions;
}