// src/models/TemplateModel.ts
// Model che gestisce i template e l'importazione di layout

import { LayoutElementOptions } from "../core/element";

export interface TemplateData {
    name: string;
    elements: LayoutElementOptions[];
    metadata?: {
        category?: string;
        description?: string;
        preview?: string;
    };
}

export class TemplateModel {
    private templates: Map<string, TemplateData> = new Map();
    private listeners: Map<string, Function[]> = new Map();

    // Cache per immagini di categoria (mantenuto dal codice originale)
    private categoryImageCount = new Map<string, number>();
    private imageCache = new Map<string, string>();
    private imageCacheStatus = new Map<string, 'loading' | 'loaded' | 'error'>();

    constructor() {
        this.initializeEventSystem();
        this.loadDefaultTemplates();
    }

    private initializeEventSystem(): void {
        this.listeners.set('templateLoaded', []);
        this.listeners.set('imageLoaded', []);
    }

    // Event system
    public addEventListener(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public removeEventListener(event: string, callback: Function): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }

    private loadDefaultTemplates(): void {
        // Qui potrebbero essere caricati template predefiniti
        // Per ora lasciamo vuoto, i template vengono creati dinamicamente
    }

    // Template management
    public registerTemplate(name: string, data: TemplateData): void {
        this.templates.set(name, data);
    }

    public getTemplate(name: string): TemplateData | null {
        return this.templates.get(name) || null;
    }

    public getAllTemplates(): TemplateData[] {
        return Array.from(this.templates.values());
    }

    // Enhanced template elements (dal codice originale)
    public enhanceTemplateElements(elementsData: any[], templateType: string): LayoutElementOptions[] {
        // Reset category counters for new template to ensure variety
        this.categoryImageCount.clear();
        
        return elementsData.map(elementData => {
            if (elementData.type === "image") {
                return this.enhanceTemplateImage(elementData, templateType);
            } else {
                return this.enhanceTemplateElement(elementData, templateType);
            }
        });
    }

    private enhanceTemplateImage(imageData: any, templateType: string): LayoutElementOptions {
        // Determina la categoria dell'immagine basata sul template e contenuto
        const category = this.getImageCategory(imageData.content, templateType);
        
        // Per ora restituiamo un placeholder, la logica di caricamento immagini 
        // verrà gestita nella View
        return {
            x: imageData.x,
            y: imageData.y,
            width: imageData.width,
            height: imageData.height,
            type: "image",
            content: this.getPlaceholderImageUrl(category)
        };
    }

    private enhanceTemplateElement(elementData: any, templateType: string): LayoutElementOptions {
        // Migliora gli elementi con colori e stili più moderni
        const enhanced = { ...elementData };
        
        // Aggiorna proprietà obsolete
        if (enhanced.fontWeight) {
            enhanced.fontBold = enhanced.fontWeight === 'bold' || enhanced.fontWeight === '700';
            delete enhanced.fontWeight;
        }
        
        if (enhanced.color) {
            enhanced.fontColor = enhanced.color;
            delete enhanced.color;
        }
        
        if (enhanced.fontStyle === 'italic') {
            enhanced.fontItalic = true;
            delete enhanced.fontStyle;
        }
        
        // Migliora i colori basati sul tipo di template
        enhanced.fontColor = enhanced.fontColor || this.getTemplateTextColor(templateType);
        
        if (enhanced.type === 'box' && !enhanced.fillColor) {
            enhanced.fillColor = this.getTemplateBoxColor(templateType);
        }
        
        return enhanced;
    }

    private getImageCategory(originalUrl: string, templateType: string): string {
        // Analizza l'URL originale per determinare la categoria appropriata
        if (originalUrl?.includes('photo-1461749280684') || originalUrl?.includes('entropy')) {
            return 'coding-workspace';
        }
        if (originalUrl?.includes('photo-1555066931') || originalUrl?.includes('office')) {
            return 'modern-office';
        }
        if (originalUrl?.includes('photo-1517077304055')) {
            return 'team-meeting';
        }
        if (originalUrl?.includes('photo-1581291518857')) {
            return 'creative-design';
        }
        if (originalUrl?.includes('photo-1586717791821')) {
            return 'technology';
        }
        if (originalUrl?.includes('photo-1611224923853')) {
            return 'business-card';
        }
        if (originalUrl?.includes('photo-1540575467063')) {
            return 'conference';
        }
        if (originalUrl?.includes('photo-1522071820081')) {
            return 'teamwork';
        }
        
        // Fallback basato sul tipo di template
        switch (templateType) {
            case 'portfolio': return 'creative-portfolio';
            case 'magazine': return 'magazine-design';
            case 'business-card': return 'business-professional';
            case 'poster': return 'event-conference';
            case 'landing-page': return 'web-development';
            default: return 'business';
        }
    }

    private getTemplateTextColor(templateType: string): string {
        switch (templateType) {
            case 'portfolio': return '#2d3748';
            case 'magazine': return '#1a202c';
            case 'business-card': return '#374151';
            case 'poster': return '#1a365d';
            case 'landing-page': return '#2d3748';
            default: return '#333333';
        }
    }

    private getTemplateBoxColor(templateType: string): string {
        switch (templateType) {
            case 'portfolio': return '#f7fafc';
            case 'magazine': return '#edf2f7';
            case 'business-card': return '#e2e8f0';
            case 'poster': return '#667eea';
            case 'landing-page': return '#f1f5f9';
            default: return '#f0f0f0';
        }
    }

    private getPlaceholderImageUrl(category: string): string {
        return `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent(category)}`;
    }

    // Default layout generation (dal codice originale)
    public createDefaultLayout(): LayoutElementOptions[] {
        console.log('Creating modern business template...');
        
        // Reset category counters for new layout
        this.categoryImageCount.clear();
        
        const elements: LayoutElementOptions[] = [];
        
        // Definisci la griglia di layout per allineamento perfetto
        const layout = {
            margin: 60,
            padding: 20,
            columnWidth: 400,
            gutter: 40,
            headerHeight: 80,
            contentHeight: 300,
            imageHeight: 180,
            footerHeight: 60
        };
        
        // Calcola posizioni basate sulla griglia
        const leftColumn = layout.margin;
        const rightColumn = leftColumn + layout.columnWidth + layout.gutter;
        const centerX = leftColumn + layout.columnWidth + (layout.gutter / 2);
        const fullWidth = layout.columnWidth * 2 + layout.gutter;
        
        // Header principale centrato con migliore allineamento
        elements.push({ 
            x: leftColumn, 
            y: layout.margin, 
            width: fullWidth, 
            height: 50, 
            type: "text", 
            content: "D.P. Jalla Business Institute", 
            fontSize: 42, 
            fontBold: true,
            fontColor: "#1a365d",
            textAlign: "center"
        });
        
        // Sottotitolo allineato
        elements.push({ 
            x: leftColumn, 
            y: layout.margin + 60, 
            width: fullWidth, 
            height: 30, 
            type: "text", 
            content: "University of Kuala Lumpur - Executive MBA Programs", 
            fontSize: 20, 
            fontColor: "#4a5568",
            textAlign: "center"
        });
        
        // Linea decorativa centrata
        const lineY = layout.margin + 110;
        elements.push({ 
            x: centerX - 200, 
            y: lineY, 
            width: 400, 
            height: 3, 
            type: "box", 
            fillColor: "#4299e1"
        });
        
        // Sezione principale: Immagine hero + box informativo
        const mainContentY = lineY + 30;
        
        // Immagine hero (colonna sinistra)
        elements.push({ 
            x: leftColumn, 
            y: mainContentY, 
            width: layout.columnWidth, 
            height: layout.contentHeight, 
            type: "image", 
            content: this.getUnsplashImageUrl('business-meeting', layout.columnWidth, layout.contentHeight, 0)
        });
        
        // Box informativo (colonna destra)
        elements.push({ 
            x: rightColumn, 
            y: mainContentY, 
            width: layout.columnWidth, 
            height: layout.contentHeight, 
            type: "box", 
            fillColor: "#f8fafc"
        });
        
        // Contenuto del box informativo con padding interno
        const boxPadding = 30;
        elements.push({ 
            x: rightColumn + boxPadding, 
            y: mainContentY + boxPadding, 
            width: layout.columnWidth - (boxPadding * 2), 
            height: 40, 
            type: "text", 
            content: "Get a Global Perspective", 
            fontSize: 28, 
            fontBold: true,
            fontColor: "#1a365d"
        });
        
        elements.push({
            x: rightColumn + boxPadding, 
            y: mainContentY + boxPadding + 60, 
            width: layout.columnWidth - (boxPadding * 2), 
            height: 200, 
            type: "text",
            content: "Transform your career with our world-class Executive MBA program. Designed for ambitious professionals, our curriculum combines cutting-edge business theory with practical application.\n\n• Global network of industry leaders\n• Flexible learning schedules\n• Real-world case studies\n• Career advancement opportunities",
            fontSize: 15,
            fontColor: "#4a5568"
        });
        
        // Sezione immagini inferiori con allineamento perfetto
        const bottomImagesY = mainContentY + layout.contentHeight + 40;
        const imageWidth = (fullWidth - (layout.gutter * 3)) / 4; // 4 immagini con 3 gutter
        
        const imagePositions = [
            leftColumn,
            leftColumn + imageWidth + (layout.gutter / 2),
            leftColumn + (imageWidth * 2) + layout.gutter,
            leftColumn + (imageWidth * 3) + (layout.gutter * 1.5)
        ];
        
        // Immagini bottom allineate con griglia
        const categories = ["university-campus", "business-team", "office-modern", "graduation"];
        imagePositions.forEach((x, index) => {
            elements.push({ 
                x, 
                y: bottomImagesY, 
                width: imageWidth, 
                height: layout.imageHeight, 
                type: "image",
                content: this.getUnsplashImageUrl(categories[index], imageWidth, layout.imageHeight, index + 1)
            });
        });
        
        // Labels perfettamente centrate sotto ogni immagine
        const imageLabels = ["Campus Life", "Team Collaboration", "Modern Facilities", "Achievement"];
        const labelsY = bottomImagesY + layout.imageHeight + 15;
        
        imageLabels.forEach((label, index) => {
            elements.push({ 
                x: imagePositions[index], 
                y: labelsY, 
                width: imageWidth, 
                height: 20, 
                type: "text", 
                content: label, 
                fontSize: 13, 
                fontBold: true,
                fontColor: "#6b7280",
                textAlign: "center"
            });
        });
        
        // Call to action footer allineato
        const footerY = labelsY + 50;
        elements.push({ 
            x: leftColumn, 
            y: footerY, 
            width: fullWidth, 
            height: layout.footerHeight, 
            type: "box", 
            fillColor: "#1a365d"
        });
        
        elements.push({ 
            x: leftColumn, 
            y: footerY + 20, 
            width: fullWidth, 
            height: 20, 
            type: "text", 
            content: "Ready to advance your career? Contact us today for more information", 
            fontSize: 16, 
            fontBold: true,
            fontColor: "#ffffff",
            textAlign: "center"
        });

        return elements;
    }

    private getUnsplashImageUrl(category: string, width: number, height: number, count: number): string {
        // Incrementa il contatore per questa categoria per ottenere immagini diverse
        const currentCount = this.categoryImageCount.get(category) || 0;
        this.categoryImageCount.set(category, currentCount + 1);
        
        // Pool di immagini specifiche per categoria da Unsplash
        const specificImages: Record<string, string[]> = {
            'business-meeting': [
                'photo-1560472354-b33ff0c44a43', // Business meeting
                'photo-1521737711867-e3b97375f902', // Team collaboration
                'photo-1553877522-43269d4ea984', // Office meeting
                'photo-1559523161-0fc0d8b38a7a'  // Business discussion
            ],
            'university-campus': [
                'photo-1507003211169-0a1dd7228f2d', // University building
                'photo-1523050854058-8df90110c9f1', // Campus library
                'photo-1541339907198-e08756dedf3f', // Students studying
                'photo-1562774053-701939374585'  // University hall
            ],
            'business-team': [
                'photo-1522202176988-66273c2fd55f', // Team working
                'photo-1515187029135-18ee286d815b', // Diverse team
                'photo-1552664730-d307ca884978', // Team collaboration
                'photo-1543269664-7eef42226a21'  // Office teamwork
            ],
            'office-modern': [
                'photo-1497366216548-37526070297c', // Modern office
                'photo-1541746972996-4e0b0f93e586', // Clean workspace
                'photo-1560472354-b33ff0c44a43', // Professional office
                'photo-1549923746-c502d488b3ea'  // Modern workplace
            ],
            'graduation': [
                'photo-1523050854058-8df90110c9f1', // Graduation ceremony
                'photo-1562774053-701939374585', // Academic achievement
                'photo-1541339907198-e08756dedf3f', // Graduation cap
                'photo-1507003211169-0a1dd7228f2d'  // University ceremony
            ]
        };

        // Seleziona l'immagine basata sul contatore per varietà
        const categoryImages = specificImages[category] || specificImages['business-team'];
        const selectedImageId = categoryImages[count % categoryImages.length];
        
        const baseParams = `w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=80`;
        
        return `https://images.unsplash.com/${selectedImageId}?${baseParams}`;
    }

    // Image cache management (mantenuto dal codice originale)
    public getCachedImage(key: string): string | null {
        return this.imageCache.get(key) || null;
    }

    public setCachedImage(key: string, url: string): void {
        this.imageCache.set(key, url);
    }

    public getImageCacheStatus(key: string): 'loading' | 'loaded' | 'error' | undefined {
        return this.imageCacheStatus.get(key);
    }

    public setImageCacheStatus(key: string, status: 'loading' | 'loaded' | 'error'): void {
        this.imageCacheStatus.set(key, status);
    }

    public clearImageCache(): void {
        this.imageCache.clear();
        this.imageCacheStatus.clear();
        this.categoryImageCount.clear();
    }

    public getCacheStats(): {size: number, loaded: number, loading: number, errors: number, categories: Record<string, number>} {
        const stats = {
            size: this.imageCache.size,
            loaded: 0,
            loading: 0,
            errors: 0,
            categories: Object.fromEntries(this.categoryImageCount)
        };
        
        for (const status of this.imageCacheStatus.values()) {
            if (status === 'loaded') stats.loaded++;
            else if (status === 'loading') stats.loading++;
            else if (status === 'error') stats.errors++;
        }
        
        return stats;
    }
}
