// src/main-hybrid.ts
// Versione ibrida che integra MVC mantenendo compatibilità totale

import { DesignCanvas } from "./core/canvas";
import { LayoutElement } from "./core/element";
import { ControlsManager } from "./managers/ControlsManager";
import { ElementCreationManager } from "./managers/ElementCreationManager";
import { SaveManager } from "./managers/SaveManager";
import { HistoryManager } from "./managers/HistoryManager";
import { UIManager } from "./managers/UIManager";
import APIService from "./services/APIService";

// Import dei nuovi moduli MVC
import { DesignModel } from "./models/DesignModel";
import { HistoryModel } from "./models/HistoryModel";
import { TemplateModel } from "./models/TemplateModel";

// Classe wrapper che estende DesignCanvas con i modelli MVC
class EnhancedDesignCanvas extends DesignCanvas {
    // Modelli MVC
    public designModel: DesignModel;
    public historyModel: HistoryModel;
    public templateModel: TemplateModel;
    
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        
        // Inizializza i modelli MVC
        this.designModel = new DesignModel();
        this.historyModel = new HistoryModel();
        this.templateModel = new TemplateModel();
        
        // Sincronizza lo stato iniziale
        this.syncWithModels();
        this.setupModelListeners();
    }
    
    private syncWithModels(): void {
        // Sincronizza gli elementi esistenti con il DesignModel
        const currentElements = this.getElements();
        if (currentElements.length > 0) {
            this.designModel.loadElements(currentElements.map(el => ({
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
            })));
        }
    }
    
    private setupModelListeners(): void {
        // Ascolta i cambiamenti del DesignModel e li applica al canvas
        this.designModel.addEventListener('elementsChanged', (data: any) => {
            // Sincronizza gli elementi del canvas con il modello
            this.syncElementsFromModel();
        });
        
        this.designModel.addEventListener('selectionChanged', (selectedElements: LayoutElement[]) => {
            // Aggiorna la selezione nel canvas tradizionale
            this.elements.forEach(el => el.isSelected = false);
            selectedElements.forEach(modelEl => {
                const canvasEl = this.elements.find(el => 
                    el.x === modelEl.x && el.y === modelEl.y && 
                    el.width === modelEl.width && el.height === modelEl.height
                );
                if (canvasEl) canvasEl.isSelected = true;
            });
            this.draw();
        });
    }
    
    private syncElementsFromModel(): void {
        const modelElements = this.designModel.getElements();
        
        // Sostituisci gli elementi del canvas con quelli del modello
        this.elements = modelElements.map(modelEl => {
            const canvasEl = new LayoutElement({
                x: modelEl.x,
                y: modelEl.y,
                width: modelEl.width,
                height: modelEl.height,
                type: modelEl.type,
                content: modelEl.content,
                fontSize: modelEl.fontSize,
                fontBold: modelEl.fontBold,
                fontItalic: modelEl.fontItalic,
                fontColor: modelEl.fontColor,
                fontFamily: modelEl.fontFamily,
                textAlign: modelEl.textAlign,
                fillColor: modelEl.fillColor
            });
            canvasEl.isSelected = modelEl.isSelected;
            return canvasEl;
        });
        
        this.draw();
    }
    
    // Override dei metodi per sincronizzare con i modelli
    addElement(element: LayoutElement): void {
        super.addElement(element);
        
        // Aggiungi anche al DesignModel
        this.designModel.addElement(element);
        
        // Salva nello storico
        this.historyModel.saveState(this.designModel.getState());
    }
    
    clearCanvas(): void {
        super.clearCanvas();
        this.designModel.clearElements();
        this.historyModel.clear();
    }
    
    // Metodi di compatibilità per i template
    loadTemplate(templateName: string, templateData?: any): void {
        if (templateData) {
            const enhancedElements = this.templateModel.enhanceTemplateElements(templateData.elements, templateName);
            this.designModel.loadElements(enhancedElements);
            this.syncElementsFromModel();
        }
    }
    
    createUnsplashImage(config: {x: number, y: number, width: number, height: number, category: string}): void {
        // Usa la logica originale mantenendo la compatibilità
        createUnsplashImage(this, config);
    }
}

// Mantieni tutte le funzioni originali per compatibilità
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
                loadTemplateElements(dc, data.elements, templateName);
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

function loadTemplateElements(dc: DesignCanvas, elementsData: any[], templateType: string): void {
    // Clear existing elements first
    dc.clearCanvas();
    
    // Reset category counters for new template to ensure variety
    categoryImageCount.clear();
    
    console.log(`Loading ${templateType} template with ${elementsData.length} elements...`);
    
    elementsData.forEach(elementData => {
        if (elementData.type === "image") {
            // Migliora le immagini del template con il nostro sistema robusto
            enhanceTemplateImage(dc, elementData, templateType);
        } else {
            // Migliora gli elementi di testo e box
            const enhancedElement = enhanceTemplateElement(elementData, templateType);
            dc.addElement(new LayoutElement(enhancedElement));
        }
    });
    
    dc.draw();
    dc.saveState();
}

function enhanceTemplateImage(dc: DesignCanvas, imageData: any, templateType: string): void {
    // Determina la categoria dell'immagine basata sul template e contenuto
    let category = getImageCategory(imageData.content, templateType);
    
    // Usa il nostro sistema robusto di caricamento immagini
    createUnsplashImage(dc, {
        x: imageData.x,
        y: imageData.y,
        width: imageData.width,
        height: imageData.height,
        category: category
    });
}

function enhanceTemplateElement(elementData: any, templateType: string): any {
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
    enhanced.fontColor = enhanced.fontColor || getTemplateTextColor(templateType);
    
    if (enhanced.type === 'box' && !enhanced.fillColor) {
        enhanced.fillColor = getTemplateBoxColor(templateType);
    }
    
    return enhanced;
}

function getImageCategory(originalUrl: string, templateType: string): string {
    // Analizza l'URL originale per determinare la categoria appropriata
    if (originalUrl.includes('photo-1461749280684') || originalUrl.includes('entropy')) {
        return 'coding-workspace';
    }
    if (originalUrl.includes('photo-1555066931') || originalUrl.includes('office')) {
        return 'modern-office';
    }
    if (originalUrl.includes('photo-1517077304055')) {
        return 'team-meeting';
    }
    if (originalUrl.includes('photo-1581291518857')) {
        return 'creative-design';
    }
    if (originalUrl.includes('photo-1586717791821')) {
        return 'technology';
    }
    if (originalUrl.includes('photo-1611224923853')) {
        return 'business-card';
    }
    if (originalUrl.includes('photo-1540575467063')) {
        return 'conference';
    }
    if (originalUrl.includes('photo-1522071820081')) {
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

function getTemplateTextColor(templateType: string): string {
    switch (templateType) {
        case 'portfolio': return '#2d3748';
        case 'magazine': return '#1a202c';
        case 'business-card': return '#374151';
        case 'poster': return '#1a365d';
        case 'landing-page': return '#2d3748';
        default: return '#333333';
    }
}

function getTemplateBoxColor(templateType: string): string {
    switch (templateType) {
        case 'portfolio': return '#f7fafc';
        case 'magazine': return '#edf2f7';
        case 'business-card': return '#e2e8f0';
        case 'poster': return '#667eea';
        case 'landing-page': return '#f1f5f9';
        default: return '#f0f0f0';
    }
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
    console.log('Creating modern business template...');
    
    // Reset category counters for new layout
    categoryImageCount.clear();
    
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
    dc.addElement(new LayoutElement({ 
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
    }));
    
    // Sottotitolo allineato
    dc.addElement(new LayoutElement({ 
        x: leftColumn, 
        y: layout.margin + 60, 
        width: fullWidth, 
        height: 30, 
        type: "text", 
        content: "University of Kuala Lumpur - Executive MBA Programs", 
        fontSize: 20, 
        fontColor: "#4a5568",
        textAlign: "center"
    }));
    
    // Linea decorativa centrata
    const lineY = layout.margin + 110;
    dc.addElement(new LayoutElement({ 
        x: centerX - 200, 
        y: lineY, 
        width: 400, 
        height: 3, 
        type: "box", 
        fillColor: "#4299e1"
    }));
    
    // Sezione principale: Immagine hero + box informativo
    const mainContentY = lineY + 30;
    
    // Immagine hero (colonna sinistra)
    createUnsplashImage(dc, { 
        x: leftColumn, 
        y: mainContentY, 
        width: layout.columnWidth, 
        height: layout.contentHeight, 
        category: "business-meeting" 
    });
    
    // Box informativo (colonna destra)
    dc.addElement(new LayoutElement({ 
        x: rightColumn, 
        y: mainContentY, 
        width: layout.columnWidth, 
        height: layout.contentHeight, 
        type: "box", 
        fillColor: "#f8fafc"
    }));
    
    // Contenuto del box informativo con padding interno
    const boxPadding = 30;
    dc.addElement(new LayoutElement({ 
        x: rightColumn + boxPadding, 
        y: mainContentY + boxPadding, 
        width: layout.columnWidth - (boxPadding * 2), 
        height: 40, 
        type: "text", 
        content: "Get a Global Perspective", 
        fontSize: 28, 
        fontBold: true,
        fontColor: "#1a365d"
    }));
    
    dc.addElement(new LayoutElement({
        x: rightColumn + boxPadding, 
        y: mainContentY + boxPadding + 60, 
        width: layout.columnWidth - (boxPadding * 2), 
        height: 200, 
        type: "text",
        content: "Transform your career with our world-class Executive MBA program. Designed for ambitious professionals, our curriculum combines cutting-edge business theory with practical application.\n\n• Global network of industry leaders\n• Flexible learning schedules\n• Real-world case studies\n• Career advancement opportunities",
        fontSize: 15,
        fontColor: "#4a5568"
    }));
    
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
    createUnsplashImage(dc, { 
        x: imagePositions[0], 
        y: bottomImagesY, 
        width: imageWidth, 
        height: layout.imageHeight, 
        category: "university-campus" 
    });
    
    createUnsplashImage(dc, { 
        x: imagePositions[1], 
        y: bottomImagesY, 
        width: imageWidth, 
        height: layout.imageHeight, 
        category: "business-team" 
    });
    
    createUnsplashImage(dc, { 
        x: imagePositions[2], 
        y: bottomImagesY, 
        width: imageWidth, 
        height: layout.imageHeight, 
        category: "office-modern" 
    });
    
    createUnsplashImage(dc, { 
        x: imagePositions[3], 
        y: bottomImagesY, 
        width: imageWidth, 
        height: layout.imageHeight, 
        category: "graduation" 
    });
    
    // Labels perfettamente centrate sotto ogni immagine
    const imageLabels = ["Campus Life", "Team Collaboration", "Modern Facilities", "Achievement"];
    const labelsY = bottomImagesY + layout.imageHeight + 15;
    
    imageLabels.forEach((label, index) => {
        dc.addElement(new LayoutElement({ 
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
        }));
    });
    
    // Call to action footer allineato
    const footerY = labelsY + 50;
    dc.addElement(new LayoutElement({ 
        x: leftColumn, 
        y: footerY, 
        width: fullWidth, 
        height: layout.footerHeight, 
        type: "box", 
        fillColor: "#1a365d"
    }));
    
    dc.addElement(new LayoutElement({ 
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
    }));

    console.log('Total elements after adding all:', dc['elements'].length);

    // Force redraw
    dc.draw();
    dc.saveState();
}

// Cache globale per le immagini
const imageCache = new Map<string, string>();
const imageCacheStatus = new Map<string, 'loading' | 'loaded' | 'error'>();
const categoryImageCount = new Map<string, number>(); // Traccia quante immagini per categoria

function createUnsplashImage(dc: DesignCanvas, config: {x: number, y: number, width: number, height: number, category: string}): void {
    // Incrementa il contatore per questa categoria per ottenere immagini diverse
    const currentCount = categoryImageCount.get(config.category) || 0;
    categoryImageCount.set(config.category, currentCount + 1);
    
    // Crea una chiave unica che include il contatore per variare le immagini
    const cacheKey = `${config.width}x${config.height}-${config.category}-${currentCount}`;
    
    // Prima aggiungiamo un placeholder immediato per mostrare qualcosa subito
    createImagePlaceholder(dc, { 
        x: config.x, 
        y: config.y, 
        width: config.width, 
        height: config.height, 
        text: "Loading..." 
    });

    // Controlla se l'immagine è già in cache
    if (imageCache.has(cacheKey)) {
        const cachedUrl = imageCache.get(cacheKey)!;
        console.log(`Using cached image for ${cacheKey}: ${cachedUrl}`);
        
        // Sostituisci immediatamente con l'immagine cached
        replaceImageElement(dc, config, cachedUrl);
        return;
    }

    // Controlla se l'immagine è già in caricamento
    if (imageCacheStatus.get(cacheKey) === 'loading') {
        console.log(`Image ${cacheKey} already loading, waiting...`);
        // Aspetta che il caricamento esistente finisca
        waitForImageLoad(cacheKey, () => {
            if (imageCache.has(cacheKey)) {
                replaceImageElement(dc, config, imageCache.get(cacheKey)!);
            }
        });
        return;
    }

    // Inizia il caricamento e marca come loading
    imageCacheStatus.set(cacheKey, 'loading');

    // Prova diversi servizi di immagini con fallback
    // Usa seed diversi per ogni immagine della stessa categoria
    const randomSeed = Math.floor(Math.random() * 10000) + currentCount * 100;
    
    // Per i template, usa prima servizi più specifici, poi casuali come fallback
    const imageUrls = getImageUrlsForCategory(config.category, config.width, config.height, currentCount, randomSeed);
    
    let currentUrlIndex = 0;
    
    const tryLoadImage = () => {
        if (currentUrlIndex >= imageUrls.length) {
            // Se tutti gli URL falliscono, crea e cache un placeholder finale
            const placeholderUrl = createPlaceholderDataURL(config.width, config.height, `${config.category} ${currentCount + 1}`);
            imageCache.set(cacheKey, placeholderUrl);
            imageCacheStatus.set(cacheKey, 'error');
            
            replaceImageElement(dc, config, placeholderUrl);
            console.log(`All URLs failed for ${cacheKey}, using generated placeholder`);
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            // Immagine caricata con successo - aggiungi alla cache
            const successUrl = imageUrls[currentUrlIndex];
            imageCache.set(cacheKey, successUrl);
            imageCacheStatus.set(cacheKey, 'loaded');
            
            console.log(`Successfully cached image ${cacheKey}: ${successUrl}`);
            
            // Sostituisci l'elemento placeholder con l'immagine caricata
            replaceImageElement(dc, config, successUrl);
        };
        
        img.onerror = () => {
            console.log(`Failed to load ${imageUrls[currentUrlIndex]} for ${cacheKey}, trying next...`);
            // Prova il prossimo URL
            currentUrlIndex++;
            tryLoadImage();
        };
        
        img.src = imageUrls[currentUrlIndex];
    };
    
    // Inizia il caricamento asincrono dopo un breve delay
    setTimeout(tryLoadImage, 100);
}

function getImageUrlsForCategory(category: string, width: number, height: number, count: number, randomSeed: number): string[] {
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
        ],
        'creative-portfolio': [
            'photo-1581291518857-4e27b48ff24e', // Creative workspace
            'photo-1461749280684-dccba630e2f6', // Design tools
            'photo-1517077304055-6e89abbf09b0', // Creative process
            'photo-1555066931-4365d14bab8c'  // Design portfolio
        ],
        'technology': [
            'photo-1518770660439-4636190af475', // Technology concept
            'photo-1561070791-2526d30994b5', // Digital innovation
            'photo-1581091226825-a6a2a5aee158', // Tech workspace
            'photo-1560472354-b33ff0c44a43'  // Modern tech
        ],
        'business-professional': [
            'photo-1507003211169-0a1dd7228f2d', // Professional portrait
            'photo-1560472354-b33ff0c44a43', // Business attire
            'photo-1521737711867-e3b97375f902', // Professional handshake
            'photo-1553877522-43269d4ea984'  // Business meeting
        ]
    };

    // Seleziona l'immagine basata sul contatore per varietà
    const categoryImages = specificImages[category] || specificImages['business-professional'];
    const selectedImageId = categoryImages[count % categoryImages.length];
    
    const baseParams = `w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=80`;
    
    return [
        `https://images.unsplash.com/${selectedImageId}?${baseParams}`,
        `https://source.unsplash.com/${width}x${height}/?${category}&sig=${randomSeed}`,
        `https://picsum.photos/${width}/${height}?random=${randomSeed}`,
        `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${category}-${count}`
    ];
}

function replaceImageElement(dc: DesignCanvas, config: {x: number, y: number, width: number, height: number}, imageUrl: string): void {
    // Trova e sostituisci l'elemento placeholder
    const elements = dc['elements'];
    const elementIndex = elements.findIndex(el => 
        el.x === config.x && el.y === config.y && 
        el.width === config.width && el.height === config.height && 
        el.type === "image"
    );
    
    if (elementIndex !== -1) {
        // Sostituisci l'elemento esistente con l'immagine caricata
        const newElement = new LayoutElement({ 
            x: config.x, 
            y: config.y, 
            width: config.width, 
            height: config.height, 
            type: "image", 
            content: imageUrl
        });
        elements[elementIndex] = newElement;
        dc.draw();
    }
}

function waitForImageLoad(cacheKey: string, callback: () => void): void {
    const checkInterval = setInterval(() => {
        const status = imageCacheStatus.get(cacheKey);
        if (status === 'loaded' || status === 'error') {
            clearInterval(checkInterval);
            callback();
        }
    }, 100);
    
    // Timeout dopo 10 secondi
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log(`Timeout waiting for image ${cacheKey}`);
    }, 10000);
}

// Funzioni di utilità per la cache
function clearImageCache(): void {
    imageCache.clear();
    imageCacheStatus.clear();
    categoryImageCount.clear();
    console.log('Image cache cleared');
}

function getCacheStats(): {size: number, loaded: number, loading: number, errors: number, categories: Record<string, number>} {
    const stats = {
        size: imageCache.size,
        loaded: 0,
        loading: 0,
        errors: 0,
        categories: Object.fromEntries(categoryImageCount)
    };
    
    for (const status of imageCacheStatus.values()) {
        if (status === 'loaded') stats.loaded++;
        else if (status === 'loading') stats.loading++;
        else if (status === 'error') stats.errors++;
    }
    
    return stats;
}

// Esponi funzioni di cache globalmente per debugging
(window as any).imageCache = {
    clear: clearImageCache,
    stats: getCacheStats,
    cache: imageCache,
    status: imageCacheStatus,
    categoryCount: categoryImageCount
};

function createPlaceholderDataURL(width: number, height: number, text: string): string {
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

function createImagePlaceholder(dc: DesignCanvas, config: {x: number, y: number, width: number, height: number, text: string}): void {
    // Crea un canvas temporaneo per generare un'immagine placeholder
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.width;
    tempCanvas.height = config.height;
    const ctx = tempCanvas.getContext('2d')!;
    
    // Background grigio chiaro
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Bordo
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, config.width-2, config.height-2);
    
    // Testo centrato
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, config.width/2, config.height/2);
    
    // Converti in data URL
    const dataURL = tempCanvas.toDataURL();
    
    // Aggiungi l'elemento immagine
    dc.addElement(new LayoutElement({ 
        x: config.x, 
        y: config.y, 
        width: config.width, 
        height: config.height, 
        type: "image", 
        content: dataURL 
    }));
}

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
    const dc = new EnhancedDesignCanvas(canvas);

    // Load template, imported data, or default layout
    loadTemplateOrImportedData(dc);

    // Initialize managers (tutte le funzionalità originali mantenute)
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

    // Esponi per debugging e compatibilità
    (window as any).dc = dc;
    (window as any).designModel = dc.designModel;
    (window as any).historyModel = dc.historyModel;
    (window as any).templateModel = dc.templateModel;
    (window as any).saveManager = saveManager;
    (window as any).uiManager = uiManager;
    (window as any).controlsManager = controlsManager;
});
