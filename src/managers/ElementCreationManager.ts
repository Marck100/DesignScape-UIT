// src/managers/ElementCreationManager.ts
// Gestisce la creazione di nuovi elementi

import { DesignCanvas } from "../core/canvas";
import { LayoutElement } from "../core/element";

export class ElementCreationManager {
    private dc: DesignCanvas;

    constructor(canvas: DesignCanvas) {
        this.dc = canvas;
        this.setupDropdown();
        this.setupKeyboardShortcuts();
    }

    private setupDropdown(): void {
        const addElementBtn = document.getElementById('add-element-btn') as HTMLButtonElement;
        const dropdownContainer = addElementBtn?.parentElement as HTMLElement;
        const dropdownItems = document.querySelectorAll('.dropdown-item') as NodeListOf<HTMLButtonElement>;

        // Dropdown toggle
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

        // Dropdown items
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownContainer?.classList.remove('open');
                
                const type = item.dataset.element as "box" | "text" | "image";
                this.createElement(type);
            });
        });
    }

    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e) => {
            // Only trigger if no input is focused
            if (this.isInputFocused()) return;

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
                this.createElement(elementType);
            }
        });
    }

    private isInputFocused(): boolean {
        const activeElement = document.activeElement;
        return activeElement?.tagName === 'INPUT' || 
               activeElement?.tagName === 'TEXTAREA' ||
               activeElement?.tagName === 'SELECT';
    }

    private createElement(type: "box" | "text" | "image"): void {
        let content: string = "";
        
        if (type === "text") {
            content = prompt("Inserisci il testo:") ?? "";
            if (content === null || content.trim() === "") return;
        }
        
        if (type === "image") {
            content = prompt("Inserisci URL immagine:") ?? "";
            if (!content || content.trim() === "") return;
            
            // Basic URL validation
            try {
                new URL(content);
            } catch {
                alert("URL non valido!");
                return;
            }
        }

        const elementConfig = {
            x: 200,
            y: 200,
            width: type === "text" ? 200 : 150,
            height: type === "text" ? 40 : 100,
            type: type,
            content
        };

        this.dc.addElement(new LayoutElement(elementConfig));
    }
}
