// Element creation and management functionality

import { DesignCanvas } from "../core/canvas";
import { LayoutElement } from "../core/element";
import { LayoutElementOptions } from "../types/element";
import { createDefaultElement, promptForElementContent, isValidText } from "../utils/elementUtils";

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
        // For text and image, use utilities to get content
        if (type === "text") {
            const content = promptForElementContent(type);
            if (!content) return; // L'utente ha annullato o inserito testo vuoto
            
            const element = createDefaultElement(type, content);
            this.dc.addElement(element);
            return;
        }
        
        // For images, keep the existing file selector
        if (type === "image") {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = () => {
                const file = fileInput.files ? fileInput.files[0] : null;
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result as string;
                    const element = createDefaultElement('image', dataUrl);
                    this.dc.addElement(element);
                };
                reader.readAsDataURL(file);
            };
            fileInput.click();
            return;
        }

        // For boxes, use default configuration
        const element = createDefaultElement(type);
        this.dc.addElement(element);
    }
}
