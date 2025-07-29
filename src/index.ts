// src/index.ts

import { LayoutElement } from "./core/element";

interface TemplateData {
    elements: any[];
    name: string;
    description: string;
}

// Templates
const templates: Record<string, TemplateData> = {
    "portfolio": {
        name: "Portfolio Showcase",
        description: "Clean layout for showcasing creative work and projects",
        elements: [
            // Title
            { x: 400, y: 80, width: 200, height: 50, type: "text", content: "Portfolio", fontSize: 28, fontWeight: "bold", textAlign: "center" },
            
            // Project Alpha
            { x: 80, y: 160, width: 180, height: 30, type: "text", content: "Project Alpha", fontSize: 16, fontWeight: "bold" },
            { x: 80, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=180&h=120&fit=crop&crop=entropy" },
            { x: 80, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Beta
            { x: 320, y: 160, width: 180, height: 30, type: "text", content: "Project Beta", fontSize: 16, fontWeight: "bold" },
            { x: 320, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=180&h=120&fit=crop&crop=entropy" },
            { x: 320, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Gamma
            { x: 560, y: 160, width: 180, height: 30, type: "text", content: "Project Gamma", fontSize: 16, fontWeight: "bold" },
            { x: 560, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=180&h=120&fit=crop&crop=entropy" },
            { x: 560, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Project Delta
            { x: 800, y: 160, width: 180, height: 30, type: "text", content: "Project Delta", fontSize: 16, fontWeight: "bold" },
            { x: 800, y: 200, width: 180, height: 120, type: "image", content: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=180&h=120&fit=crop&crop=entropy" },
            { x: 800, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 }
        ]
    },
    
    "magazine": {
        name: "Magazine Layout",
        description: "Hero image with sidebar text - asymmetric layout with visual hierarchy",
        elements: [
            // Title
            { x: 50, y: 50, width: 900, height: 80, type: "text", content: "DESIGN MAGAZINE", fontSize: 48, fontWeight: "bold", textAlign: "center" },
            
            // Image
            { x: 50, y: 150, width: 600, height: 350, type: "image", content: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=350&fit=crop&crop=entropy" },
            
            // Background box
            { x: 670, y: 140, width: 300, height: 370, type: "box", content: "", color: "#f8fafc" },
            
            // Text (on the right)
            { x: 690, y: 160, width: 260, height: 180, type: "text", content: "Creative Design Trends\n\nExploring the latest innovations in visual design and user experience. This article covers emerging techniques and methodologies.", fontSize: 16, fontWeight: "bold" },
            { x: 690, y: 360, width: 260, height: 130, type: "text", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.", fontSize: 12 },
            
            // Text (below the image)
            { x: 50, y: 520, width: 600, height: 60, type: "text", content: "Caption: Modern design principles in action - demonstrating visual balance and content hierarchy.", fontSize: 10, fontStyle: "italic" }
        ]
    },
    
    "business-card": {
        name: "Card Layout",
        description: "Compact design with balanced text and image placement",
        elements: [
            // Background box
            { x: 30, y: 60, width: 380, height: 200, type: "box", content: "", color: "#ffffff" },
            
            // Header box
            { x: 30, y: 60, width: 380, height: 60, type: "box", content: "", color: "#667eea" },
            
            // Text
            { x: 50, y: 75, width: 200, height: 30, type: "text", content: "Alex Designer", fontSize: 20, fontWeight: "bold", color: "#ffffff" },
            
            // Image
            { x: 320, y: 70, width: 70, height: 40, type: "image", content: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=70&h=40&fit=crop&crop=entropy" },
            
            // Title
            { x: 50, y: 140, width: 290, height: 25, type: "text", content: "Creative Director & UX Designer", fontSize: 14, fontWeight: "500", color: "#4a5568" },
            
            // Contacts
            { x: 50, y: 170, width: 290, height: 80, type: "text", content: "✉ alex@studio.com\n📞 +1 (555) 123-4567\n🌐 alexdesign.studio\n📍 123 Creative Street, Design City", fontSize: 11, color: "#374151" }
        ]
    },
    
    "poster": {
        name: "Poster Design",
        description: "Centered composition with strong typography and focal image",
        elements: [
            // Background box
            { x: 80, y: 60, width: 840, height: 120, type: "box", content: "", color: "#667eea" },
            
            // Title
            { x: 100, y: 90, width: 800, height: 60, type: "text", content: "DESIGN CONFERENCE 2025", fontSize: 42, fontWeight: "bold", textAlign: "center", color: "#ffffff" },
            
            // Subtitle
            { x: 100, y: 200, width: 800, height: 40, type: "text", content: "The Future of Creative Technology", fontSize: 24, textAlign: "center", color: "#374151" },
            
            // Image
            { x: 200, y: 260, width: 600, height: 300, type: "image", content: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop&crop=entropy" },
            
            // Information box
            { x: 150, y: 580, width: 700, height: 80, type: "box", content: "", color: "#f1f5f9" },
            
            // Information text
            { x: 170, y: 600, width: 660, height: 40, type: "text", content: "March 15-17, 2025 • Design Center Downtown • Tickets available now", fontSize: 16, textAlign: "center", fontWeight: "500", color: "#1a202c" },
            
            // Call to action
            { x: 350, y: 680, width: 300, height: 40, type: "text", content: "Register at designconf2025.com", fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#667eea" }
        ]
    },
    
    "landing-page": {
        name: "Landing Page",
        description: "Split-screen layout with navigation and feature sections",
        elements: [
            // Nnavigation bar
            { x: 30, y: 30, width: 940, height: 60, type: "box", content: "", color: "#ffffff" },
            { x: 50, y: 50, width: 150, height: 20, type: "text", content: "BRAND LOGO", fontSize: 16, fontWeight: "bold", color: "#1a202c" },
            { x: 700, y: 50, width: 250, height: 20, type: "text", content: "Home    About    Services    Contact", fontSize: 14, fontWeight: "500", textAlign: "right", color: "#4a5568" },
            
            // Hero split-screen
            { x: 50, y: 120, width: 450, height: 250, type: "image", content: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=450&h=250&fit=crop&crop=entropy" },
            
            // Hero text and box section
            { x: 520, y: 120, width: 430, height: 250, type: "box", content: "", color: "#f8fafc" },
            { x: 540, y: 150, width: 390, height: 80, type: "text", content: "Transform Your Ideas Into Reality", fontSize: 28, fontWeight: "bold", color: "#1a202c" },
            { x: 540, y: 240, width: 390, height: 80, type: "text", content: "We create stunning digital experiences that engage users and drive results. Let's build something amazing together.", fontSize: 16, color: "#4a5568" },
            { x: 540, y: 330, width: 120, height: 30, type: "box", content: "", color: "#667eea" },
            { x: 550, y: 340, width: 100, height: 10, type: "text", content: "Get Started", fontSize: 14, fontWeight: "bold", textAlign: "center", color: "#ffffff" },
            
            // Features section
            { x: 50, y: 400, width: 900, height: 60, type: "text", content: "Our Services", fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#1a202c" },
            
            // Feature boxes
            { x: 50, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 70, y: 500, width: 240, height: 60, type: "text", content: "Web Development\nCustom websites and applications", fontSize: 14, fontWeight: "500", color: "#374151" },
            
            { x: 360, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 380, y: 500, width: 240, height: 60, type: "text", content: "UI/UX Design\nUser-centered design solutions", fontSize: 14, fontWeight: "500", color: "#374151" },
            
            { x: 670, y: 480, width: 280, height: 100, type: "box", content: "", color: "#f1f5f9" },
            { x: 690, y: 500, width: 240, height: 60, type: "text", content: "Digital Strategy\nData-driven growth solutions", fontSize: 14, fontWeight: "500", color: "#374151" }
        ]
    }
};

class HomePageManager {
    private importModal: HTMLElement | null = null;
    private jsonFileInput: HTMLInputElement | null = null;
    private jsonTextArea: HTMLTextAreaElement | null = null;

    constructor() {
        this.initializeEventListeners();
        this.setupModal();
        this.renderTemplatePreview();
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

    private renderTemplatePreview(): void {
        // Le preview sono gestite tramite wireframes CSS nell'HTML
        // Non serve più il rendering via Canvas
        console.log('Template previews are rendered using CSS wireframes');
    }

}

// Initialize the home page when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new HomePageManager();
});
