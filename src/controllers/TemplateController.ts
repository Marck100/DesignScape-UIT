// src/controllers/TemplateController.ts
// Controller che gestisce i template e il caricamento di immagini

import { TemplateModel, TemplateData } from "../models/TemplateModel";
import { DesignModel } from "../models/DesignModel";
import { LayoutElement, LayoutElementOptions } from "../core/element";

export class TemplateController {
    private templateModel: TemplateModel;
    private designModel: DesignModel;
    private listeners: Map<string, Function[]> = new Map();

    constructor(templateModel: TemplateModel, designModel: DesignModel) {
        this.templateModel = templateModel;
        this.designModel = designModel;
        this.initializeEventSystem();
        this.setupTemplateModelEvents();
    }

    private initializeEventSystem(): void {
        this.listeners.set('templateLoaded', []);
        this.listeners.set('imageLoaded', []);
        this.listeners.set('templateCreated', []);
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

    private setupTemplateModelEvents(): void {
        this.templateModel.addEventListener('templateLoaded', (data: any) => {
            this.emit('templateLoaded', data);
        });

        this.templateModel.addEventListener('imageLoaded', (data: any) => {
            this.emit('imageLoaded', data);
        });
    }

    // Template management
    public loadTemplate(templateName: string, templateData?: any): void {
        if (templateData) {
            // Load from provided data (e.g., from sessionStorage)
            try {
                const enhancedElements = this.templateModel.enhanceTemplateElements(templateData.elements, templateName);
                this.designModel.loadElements(enhancedElements);
                this.emit('templateLoaded', { name: templateName, elements: enhancedElements });
            } catch (error) {
                console.error('Error loading template:', error);
                this.loadDefaultTemplate();
            }
        } else {
            // Load predefined template
            const template = this.templateModel.getTemplate(templateName);
            if (template) {
                this.designModel.loadElements(template.elements);
                this.emit('templateLoaded', template);
            } else {
                this.loadDefaultTemplate();
            }
        }
    }

    public loadDefaultTemplate(): void {
        const defaultElements = this.templateModel.createDefaultLayout();
        this.designModel.loadElements(defaultElements);
        this.emit('templateLoaded', { name: 'default', elements: defaultElements });
    }

    public saveAsTemplate(name: string, description?: string): TemplateData {
        const currentElements = this.designModel.getElements();
        const templateData: TemplateData = {
            name,
            elements: currentElements.map(el => ({
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                type: el.type,
                content: el.content,
                fontSize: el.fontSize,
                fontBold: el.fontBold,
                fontItalic: el.fontItalic,
                fontColor: el.fontColor,
                fontFamily: el.fontFamily,
                textAlign: el.textAlign,
                fillColor: el.fillColor
            })),
            metadata: {
                description,
                category: 'custom'
            }
        };

        this.templateModel.registerTemplate(name, templateData);
        this.emit('templateCreated', templateData);
        
        return templateData;
    }

    public getAllTemplates(): TemplateData[] {
        return this.templateModel.getAllTemplates();
    }

    // Image management with Unsplash integration
    public createUnsplashImage(x: number, y: number, width: number, height: number, category: string): void {
        // Create placeholder first
        const placeholderElement = new LayoutElement({
            x,
            y,
            width,
            height,
            type: "image",
            content: this.createPlaceholderDataURL(width, height, "Loading...")
        });

        this.designModel.addElement(placeholderElement);

        // Load actual image asynchronously
        this.loadUnsplashImage(placeholderElement, category, width, height);
    }

    private loadUnsplashImage(element: LayoutElement, category: string, width: number, height: number): void {
        // Generate cache key
        const currentCount = this.getCategoryCount(category);
        const cacheKey = `${width}x${height}-${category}-${currentCount}`;
        
        // Check cache first
        const cachedUrl = this.templateModel.getCachedImage(cacheKey);
        if (cachedUrl) {
            this.replaceImageContent(element, cachedUrl);
            return;
        }

        // Check if already loading
        if (this.templateModel.getImageCacheStatus(cacheKey) === 'loading') {
            this.waitForImageLoad(cacheKey, (url: string | null) => {
                if (url) {
                    this.replaceImageContent(element, url);
                }
            });
            return;
        }

        // Start loading
        this.templateModel.setImageCacheStatus(cacheKey, 'loading');
        
        const imageUrls = this.getImageUrlsForCategory(category, width, height, currentCount);
        this.tryLoadImageUrls(element, imageUrls, cacheKey, 0);
    }

    private tryLoadImageUrls(element: LayoutElement, urls: string[], cacheKey: string, urlIndex: number): void {
        if (urlIndex >= urls.length) {
            // All URLs failed, use generated placeholder
            const placeholderUrl = this.createPlaceholderDataURL(element.width, element.height, `Failed to load ${cacheKey}`);
            this.templateModel.setCachedImage(cacheKey, placeholderUrl);
            this.templateModel.setImageCacheStatus(cacheKey, 'error');
            this.replaceImageContent(element, placeholderUrl);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const successUrl = urls[urlIndex];
            this.templateModel.setCachedImage(cacheKey, successUrl);
            this.templateModel.setImageCacheStatus(cacheKey, 'loaded');
            this.replaceImageContent(element, successUrl);
            this.emit('imageLoaded', { element, url: successUrl });
        };
        
        img.onerror = () => {
            console.log(`Failed to load ${urls[urlIndex]}, trying next...`);
            this.tryLoadImageUrls(element, urls, cacheKey, urlIndex + 1);
        };
        
        img.src = urls[urlIndex];
    }

    private replaceImageContent(element: LayoutElement, imageUrl: string): void {
        element.content = imageUrl;
        // Trigger a re-render by emitting an update event
        this.emit('imageLoaded', { element, url: imageUrl });
    }

    private waitForImageLoad(cacheKey: string, callback: (url: string | null) => void): void {
        const checkInterval = setInterval(() => {
            const status = this.templateModel.getImageCacheStatus(cacheKey);
            if (status === 'loaded' || status === 'error') {
                clearInterval(checkInterval);
                const url = this.templateModel.getCachedImage(cacheKey);
                callback(url);
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log(`Timeout waiting for image ${cacheKey}`);
            callback(null);
        }, 10000);
    }

    private getCategoryCount(category: string): number {
        const stats = this.templateModel.getCacheStats();
        return stats.categories[category] || 0;
    }

    private getImageUrlsForCategory(category: string, width: number, height: number, count: number): string[] {
        // Pool di immagini specifiche per categoria da Unsplash
        const specificImages: Record<string, string[]> = {
            'business-meeting': [
                'photo-1560472354-b33ff0c44a43',
                'photo-1521737711867-e3b97375f902',
                'photo-1553877522-43269d4ea984',
                'photo-1559523161-0fc0d8b38a7a'
            ],
            'university-campus': [
                'photo-1507003211169-0a1dd7228f2d',
                'photo-1523050854058-8df90110c9f1',
                'photo-1541339907198-e08756dedf3f',
                'photo-1562774053-701939374585'
            ],
            'business-team': [
                'photo-1522202176988-66273c2fd55f',
                'photo-1515187029135-18ee286d815b',
                'photo-1552664730-d307ca884978',
                'photo-1543269664-7eef42226a21'
            ],
            'office-modern': [
                'photo-1497366216548-37526070297c',
                'photo-1541746972996-4e0b0f93e586',
                'photo-1560472354-b33ff0c44a43',
                'photo-1549923746-c502d488b3ea'
            ],
            'graduation': [
                'photo-1523050854058-8df90110c9f1',
                'photo-1562774053-701939374585',
                'photo-1541339907198-e08756dedf3f',
                'photo-1507003211169-0a1dd7228f2d'
            ],
            'creative-portfolio': [
                'photo-1581291518857-4e27b48ff24e',
                'photo-1461749280684-dccba630e2f6',
                'photo-1517077304055-6e89abbf09b0',
                'photo-1555066931-4365d14bab8c'
            ]
        };

        const categoryImages = specificImages[category] || specificImages['business-team'];
        const selectedImageId = categoryImages[count % categoryImages.length];
        
        const randomSeed = Math.floor(Math.random() * 10000) + count * 100;
        const baseParams = `w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=80`;
        
        return [
            `https://images.unsplash.com/${selectedImageId}?${baseParams}`,
            `https://source.unsplash.com/${width}x${height}/?${category}&sig=${randomSeed}`,
            `https://picsum.photos/${width}/${height}?random=${randomSeed}`,
            `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(category)}`
        ];
    }

    private createPlaceholderDataURL(width: number, height: number, text: string): string {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d')!;
        
        // Background grigio chiaro
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Bordo
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width-2, height-2);
        
        // Testo centrato
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width/2, height/2);
        
        return tempCanvas.toDataURL();
    }

    // Import/Export functionality
    public importLayout(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            if (data.elements) {
                this.designModel.loadElements(data.elements);
                this.emit('templateLoaded', { name: 'imported', elements: data.elements });
            }
        } catch (error) {
            throw new Error('Invalid JSON data for import');
        }
    }

    public exportCurrentAsTemplate(): string {
        const currentState = this.designModel.getState();
        return JSON.stringify({
            elements: currentState.elements.map(el => ({
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                type: el.type,
                content: el.content,
                fontSize: el.fontSize,
                fontBold: el.fontBold,
                fontItalic: el.fontItalic,
                fontColor: el.fontColor,
                fontFamily: el.fontFamily,
                textAlign: el.textAlign,
                fillColor: el.fillColor
            })),
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0'
            }
        }, null, 2);
    }

    // Enhanced image loading for templates (from original code)
    public enhanceTemplateImage(element: LayoutElement, templateType: string): void {
        if (element.type !== 'image') return;
        
        // Determine image category based on template and content
        const category = this.determineImageCategory(element.content, templateType);
        
        // Use robust image loading system
        this.loadUnsplashImage(element, category, element.width, element.height);
    }

    private determineImageCategory(originalUrl?: string, templateType?: string): string {
        // Analyze original URL to determine appropriate category
        if (originalUrl?.includes('photo-1461749280684') || originalUrl?.includes('entropy')) {
            return 'coding-workspace';
        }
        if (originalUrl?.includes('photo-1555066931') || originalUrl?.includes('office')) {
            return 'modern-office';
        }
        if (originalUrl?.includes('photo-1517077304055')) {
            return 'team-meeting';
        }
        
        // Fallback based on template type
        switch (templateType) {
            case 'portfolio': return 'creative-portfolio';
            case 'magazine': return 'magazine-design';
            case 'business-card': return 'business-professional';
            case 'poster': return 'event-conference';
            case 'landing-page': return 'web-development';
            default: return 'business';
        }
    }

    // Cache management
    public clearImageCache(): void {
        this.templateModel.clearImageCache();
    }

    public getCacheStats(): any {
        return this.templateModel.getCacheStats();
    }

    // Template-specific element enhancement
    public enhanceElementsForTemplate(elements: LayoutElementOptions[], templateType: string): LayoutElementOptions[] {
        return this.templateModel.enhanceTemplateElements(elements, templateType);
    }
}
