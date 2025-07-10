// src/home.ts

import { LayoutElement } from "./core/element";

interface TemplateData {
    elements: any[];
    name: string;
    description: string;
}

// Template predefiniti
const templates: Record<string, TemplateData> = {
    "portfolio": {
        name: "Portfolio Showcase",
        description: "Clean layout for showcasing creative work and projects",
        elements: [
            // Titolo principale
            { x: 400, y: 80, width: 200, height: 50, type: "text", content: "Portfolio", fontSize: 28, fontWeight: "bold", textAlign: "center" },
            
            // Progetto 1
            { x: 80, y: 160, width: 180, height: 30, type: "text", content: "Project Alpha", fontSize: 16, fontWeight: "bold" },
            { x: 80, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Alpha" },
            { x: 80, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 2
            { x: 320, y: 160, width: 180, height: 30, type: "text", content: "Project Beta", fontSize: 16, fontWeight: "bold" },
            { x: 320, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Beta" },
            { x: 320, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 3
            { x: 560, y: 160, width: 180, height: 30, type: "text", content: "Project Gamma", fontSize: 16, fontWeight: "bold" },
            { x: 560, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Gamma" },
            { x: 560, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 },
            
            // Progetto 4
            { x: 800, y: 160, width: 180, height: 30, type: "text", content: "Project Delta", fontSize: 16, fontWeight: "bold" },
            { x: 800, y: 200, width: 180, height: 120, type: "image", content: "https://via.placeholder.com/180x120?text=Project+Delta" },
            { x: 800, y: 330, width: 180, height: 40, type: "text", content: "Brief description of this creative project and its key features.", fontSize: 11 }
        ]
    },
    
    "magazine": {
        name: "Magazine Layout",
        description: "Hero image with sidebar text - asymmetric layout with visual hierarchy",
        elements: [
            // Titolo principale
            { x: 50, y: 50, width: 900, height: 80, type: "text", content: "DESIGN MAGAZINE", fontSize: 48, fontWeight: "bold", textAlign: "center" },
            
            // Immagine hero
            { x: 50, y: 150, width: 600, height: 350, type: "image", content: "https://via.placeholder.com/600x350?text=Hero+Image" },
            
            // Box colorato di sfondo per la sidebar
            { x: 670, y: 140, width: 300, height: 370, type: "box", content: "", color: "#f8fafc" },
            
            // Colonna di testo a destra
            { x: 690, y: 160, width: 260, height: 180, type: "text", content: "Creative Design Trends\n\nExploring the latest innovations in visual design and user experience. This article covers emerging techniques and methodologies.", fontSize: 16, fontWeight: "bold" },
            { x: 690, y: 360, width: 260, height: 130, type: "text", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.", fontSize: 12 },
            
            // Testo sotto l'immagine
            { x: 50, y: 520, width: 600, height: 60, type: "text", content: "Caption: Modern design principles in action - demonstrating visual balance and content hierarchy.", fontSize: 10, fontStyle: "italic" }
        ]
    },
    
    "business-card": {
        name: "Card Layout",
        description: "Compact design with balanced text and image placement",
        elements: [
            // Box di sfondo principale
            { x: 30, y: 60, width: 380, height: 200, type: "box", content: "", color: "#ffffff" },
            
            // Box colorato per il header
            { x: 30, y: 60, width: 380, height: 60, type: "box", content: "", color: "#667eea" },
            
            // Nome in bianco sul box colorato
            { x: 50, y: 75, width: 200, height: 30, type: "text", content: "Alex Designer", fontSize: 20, fontWeight: "bold", color: "#ffffff" },
            
            // Logo/Immagine
            { x: 320, y: 70, width: 70, height: 40, type: "image", content: "https://via.placeholder.com/70x40?text=LOGO" },
            
            // Titolo
            { x: 50, y: 140, width: 290, height: 25, type: "text", content: "Creative Director & UX Designer", fontSize: 14, fontWeight: "500", color: "#4a5568" },
            
            // Contatti
            { x: 50, y: 170, width: 290, height: 80, type: "text", content: "✉ alex@studio.com\n📞 +1 (555) 123-4567\n🌐 alexdesign.studio\n📍 123 Creative Street, Design City", fontSize: 11, color: "#374151" }
        ]
    },
    
    "poster": {
        name: "Poster Design",
        description: "Centered composition with strong typography and focal image",
        elements: [
            // Box di sfondo colorato
            { x: 80, y: 60, width: 840, height: 120, type: "box", content: "", color: "#667eea" },
            
            // Titolo principale in bianco
            { x: 100, y: 90, width: 800, height: 60, type: "text", content: "DESIGN CONFERENCE 2025", fontSize: 42, fontWeight: "bold", textAlign: "center", color: "#ffffff" },
            
            // Sottotitolo
            { x: 100, y: 200, width: 800, height: 40, type: "text", content: "The Future of Creative Technology", fontSize: 24, textAlign: "center", color: "#374151" },
            
            // Immagine principale
            { x: 200, y: 260, width: 600, height: 300, type: "image", content: "https://via.placeholder.com/600x300?text=Event+Image" },
            
            // Box informazioni
            { x: 150, y: 580, width: 700, height: 80, type: "box", content: "", color: "#f1f5f9" },
            
            // Informazioni evento nel box
            { x: 170, y: 600, width: 660, height: 40, type: "text", content: "March 15-17, 2025 • Design Center Downtown • Tickets available now", fontSize: 16, textAlign: "center", fontWeight: "500", color: "#1a202c" },
            
            // Call to action
            { x: 350, y: 680, width: 300, height: 40, type: "text", content: "Register at designconf2025.com", fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#667eea" }
        ]
    },
    
    "landing-page": {
        name: "Landing Page",
        description: "Split-screen layout with navigation and feature sections",
        elements: [
            // Header navigation bar
            { x: 30, y: 30, width: 940, height: 60, type: "box", content: "", color: "#ffffff" },
            { x: 50, y: 50, width: 150, height: 20, type: "text", content: "BRAND LOGO", fontSize: 16, fontWeight: "bold", color: "#1a202c" },
            { x: 700, y: 50, width: 250, height: 20, type: "text", content: "Home    About    Services    Contact", fontSize: 14, fontWeight: "500", textAlign: "right", color: "#4a5568" },
            
            // Hero split-screen
            { x: 50, y: 120, width: 450, height: 250, type: "image", content: "https://via.placeholder.com/450x250?text=Hero+Image" },
            
            // Hero text section con box di sfondo
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
        const canvases = document.querySelectorAll<HTMLCanvasElement>('.template-canvas');
        canvases.forEach(canvas => {
            const templateKey = canvas.dataset.template;
            if (templateKey && templates[templateKey]) {
                this.drawTemplateOnCanvas(canvas, templates[templateKey]);
            }
        });
    }

    private drawTemplateOnCanvas(canvas: HTMLCanvasElement, template: TemplateData): void {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Create abstract representation based on template type
        this.drawAbstractPreview(ctx, template.name, canvasWidth, canvasHeight);
    }

    private drawAbstractPreview(ctx: CanvasRenderingContext2D, templateName: string, width: number, height: number): void {
        // Set gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        
        switch (templateName) {
            case 'Portfolio Showcase':
                this.drawPortfolioPreview(ctx, width, height);
                break;
            case 'Magazine Layout':
                this.drawMagazinePreview(ctx, width, height);
                break;
            case 'Card Layout':
                this.drawCardPreview(ctx, width, height);
                break;
            case 'Poster Design':
                this.drawPosterPreview(ctx, width, height);
                break;
            case 'Landing Page':
                this.drawLandingPreview(ctx, width, height);
                break;
            default:
                this.drawDefaultPreview(ctx, width, height);
                break;
        }
    }

    private drawPortfolioPreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Grid of squares representing portfolio items
        const cols = 4;
        const rows = 2;
        const spacing = 8;
        const totalSpacing = spacing * (cols + 1);
        const squareSize = (width - totalSpacing) / cols;
        
        // Palette più coerente con blu e viola
        const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#6366f1', '#a855f7', '#6366f1', '#8b5cf6', '#3b82f6'];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = spacing + col * (squareSize + spacing);
                const y = height * 0.3 + row * (squareSize + spacing);
                const colorIndex = row * cols + col;
                
                // Rounded rectangle
                ctx.fillStyle = colors[colorIndex] || '#6366f1';
                this.roundRect(ctx, x, y, squareSize, squareSize * 0.7, 6);
                ctx.fill();
            }
        }

        // Title bar
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, width * 0.1, height * 0.1, width * 0.8, height * 0.1, 4);
        ctx.fill();
    }

    private drawMagazinePreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Hero image area (left side)
        const gradient = ctx.createLinearGradient(0, 0, width * 0.6, height);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        this.roundRect(ctx, width * 0.05, height * 0.2, width * 0.55, height * 0.6, 8);
        ctx.fill();

        // Text column (right side)
        const lineHeight = height * 0.04;
        for (let i = 0; i < 8; i++) {
            const lineWidth = width * (0.25 + Math.random() * 0.1);
            ctx.fillStyle = i < 2 ? '#1e293b' : '#64748b';
            this.roundRect(ctx, width * 0.65, height * 0.25 + i * lineHeight, lineWidth, lineHeight * 0.6, 2);
            ctx.fill();
        }

        // Title
        ctx.fillStyle = '#0f172a';
        this.roundRect(ctx, width * 0.1, height * 0.05, width * 0.8, height * 0.08, 4);
        ctx.fill();
    }

    private drawCardPreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
        this.roundRect(ctx, width * 0.1, height * 0.15, width * 0.8, height * 0.7, 12);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Header bar
        const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
        headerGradient.addColorStop(0, '#667eea');
        headerGradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = headerGradient;
        this.roundRect(ctx, width * 0.1, height * 0.15, width * 0.8, height * 0.2, 12);
        ctx.fill();

        // Name placeholder
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, width * 0.15, height * 0.22, width * 0.4, height * 0.06, 3);
        ctx.fill();

        // Logo area
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.roundRect(ctx, width * 0.75, height * 0.2, width * 0.1, height * 0.1, 6);
        ctx.fill();

        // Contact lines
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = '#94a3b8';
            const lineWidth = width * (0.2 + Math.random() * 0.15);
            this.roundRect(ctx, width * 0.15, height * 0.45 + i * height * 0.06, lineWidth, height * 0.025, 2);
            ctx.fill();
        }
    }

    private drawPosterPreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Background
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, width, height);

        // Main title bar
        const titleGradient = ctx.createLinearGradient(0, 0, width, 0);
        titleGradient.addColorStop(0, '#667eea');
        titleGradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = titleGradient;
        this.roundRect(ctx, width * 0.1, height * 0.1, width * 0.8, height * 0.15, 8);
        ctx.fill();

        // Central image area - using purple/blue gradient instead of yellow
        const imageGradient = ctx.createLinearGradient(0, 0, width, height);
        imageGradient.addColorStop(0, '#8b5cf6');
        imageGradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = imageGradient;
        this.roundRect(ctx, width * 0.2, height * 0.35, width * 0.6, height * 0.3, 10);
        ctx.fill();

        // Info box
        ctx.fillStyle = '#e2e8f0';
        this.roundRect(ctx, width * 0.15, height * 0.75, width * 0.7, height * 0.1, 6);
        ctx.fill();

        // Subtitle
        ctx.fillStyle = '#64748b';
        this.roundRect(ctx, width * 0.25, height * 0.28, width * 0.5, height * 0.04, 3);
        ctx.fill();
    }

    private drawLandingPreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Navigation bar
        ctx.fillStyle = '#f8fafc';
        this.roundRect(ctx, width * 0.05, height * 0.05, width * 0.9, height * 0.1, 6);
        ctx.fill();

        // Nav items
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = '#64748b';
            this.roundRect(ctx, width * 0.6 + i * width * 0.08, height * 0.08, width * 0.06, height * 0.04, 2);
            ctx.fill();
        }

        // Hero split layout
        // Left - image
        const heroGradient = ctx.createLinearGradient(0, 0, width * 0.45, height);
        heroGradient.addColorStop(0, '#3b82f6');
        heroGradient.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = heroGradient;
        this.roundRect(ctx, width * 0.05, height * 0.2, width * 0.4, height * 0.35, 8);
        ctx.fill();

        // Right - text area
        ctx.fillStyle = '#f8fafc';
        this.roundRect(ctx, width * 0.5, height * 0.2, width * 0.45, height * 0.35, 8);
        ctx.fill();

        // Text lines
        for (let i = 0; i < 3; i++) {
            const lineWidth = width * (0.25 + Math.random() * 0.1);
            ctx.fillStyle = i === 0 ? '#1e293b' : '#64748b';
            this.roundRect(ctx, width * 0.55, height * 0.25 + i * height * 0.06, lineWidth, height * 0.03, 2);
            ctx.fill();
        }

        // CTA button
        ctx.fillStyle = '#3b82f6';
        this.roundRect(ctx, width * 0.55, height * 0.45, width * 0.15, height * 0.06, 4);
        ctx.fill();

        // Feature boxes
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#f1f5f9';
            this.roundRect(ctx, width * 0.05 + i * width * 0.3, height * 0.65, width * 0.25, height * 0.25, 6);
            ctx.fill();
        }
    }

    private drawDefaultPreview(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Simple geometric pattern
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#e2e8f0');
        gradient.addColorStop(1, '#cbd5e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Abstract shapes
        ctx.fillStyle = '#64748b';
        this.roundRect(ctx, width * 0.2, height * 0.2, width * 0.6, height * 0.1, 6);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        this.roundRect(ctx, width * 0.1, height * 0.4, width * 0.35, height * 0.4, 8);
        ctx.fill();

        ctx.fillStyle = '#cbd5e0';
        this.roundRect(ctx, width * 0.55, height * 0.4, width * 0.35, height * 0.4, 8);
        ctx.fill();
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Initialize the home page when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new HomePageManager();
});
