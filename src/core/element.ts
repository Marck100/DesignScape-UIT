// Layout element class with rendering and manipulation capabilities

import { ElementType, TextAlign, LayoutElementOptions } from "../types/element";

export class LayoutElement {
    x: number;
    y: number;
    width: number;
    height: number;
    type: ElementType;
    content?: string;
    fillColor?: string;
    isSelected: boolean = false;

    resizeHandleSize: number = 12; // Increased from 10 to 12 for better visibility

    isEditing: boolean = false;
    cursorVisible: boolean = false;

    fontFamily: string = "Arial";
    fontSize: number = 20;
    fontColor: string = "#333";
    fontBold: boolean = false;
    fontItalic: boolean = false;
    textAlign: TextAlign = "left";

    // Static shared image cache for all elements with timestamp
    private static imageCache: Map<string, { img: HTMLImageElement; timestamp: number }> = new Map();
    private static loadingImages: Set<string> = new Set(); // Track images currently being loaded
    private static failedImages: Set<string> = new Set(); // Track images that failed to load
    private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
    
    // If locked, element cannot be moved or resized or edited
    locked: boolean = false;

    constructor(options: LayoutElementOptions) {
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.type = options.type;
        this.content = options.content;
        this.fillColor = options.fillColor;

        if (this.type === "text") {
            this.fontFamily = options.fontFamily ?? this.fontFamily;
            this.fontSize = options.fontSize ?? this.fontSize;
            this.fontColor = options.fontColor ?? this.fontColor;
            this.fontBold = options.fontBold ?? this.fontBold;
            this.fontItalic = options.fontItalic ?? this.fontItalic;
        }
    }

    toSerializable(): object {
        return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        type: this.type,
        content: this.content ?? null
        };
    }

    getResizeHandles(): {x: number, y: number}[] {
        return [
            { x: this.x, y: this.y },                                               // top-left corner
            { x: this.x + this.width, y: this.y },                                 // top-right corner  
            { x: this.x, y: this.y + this.height },                               // bottom-left corner
            { x: this.x + this.width, y: this.y + this.height }                   // bottom-right corner
        ];
    }


    getResizeHandle(px: number, py: number): number | null {
        const tolerance = 15; // Increased hit area for better UX
        
        // Handle centers (corners of the element)
        const handles = this.getResizeHandles();

        for (let i = 0; i < handles.length; i++) {
            const h = handles[i];
            if (
                px >= h.x - tolerance &&
                px <= h.x + tolerance &&
                py >= h.y - tolerance &&
                py <= h.y + tolerance
            ) {
                return i;
            }
        }
        return null;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        if (this.isSelected) {
            // Main elegant blue-purple border (matching project theme)
            ctx.strokeStyle = "#667eea";
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);

            // Thin outer border for contrast
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);

            // Handle di ridimensionamento più visibili
            for (const h of this.getResizeHandles()) {
                // Ombra leggera per profondità
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(
                    h.x - this.resizeHandleSize / 2 + 1,
                    h.y - this.resizeHandleSize / 2 + 1,
                    this.resizeHandleSize,
                    this.resizeHandleSize
                );
                
                // Handle principale con sfondo bianco
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(
                    h.x - this.resizeHandleSize / 2,
                    h.y - this.resizeHandleSize / 2,
                    this.resizeHandleSize,
                    this.resizeHandleSize
                );
                
                // Blue border for contrast and theme consistency
                ctx.strokeStyle = "#667eea";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    h.x - this.resizeHandleSize / 2,
                    h.y - this.resizeHandleSize / 2,
                    this.resizeHandleSize,
                    this.resizeHandleSize
                );
            }
        }

        switch (this.type) {
            case "text":
                console.log('Drawing text element:', this.content, 'at', this.x, this.y);
                
                ctx.fillStyle = this.fontColor;
                ctx.textAlign = this.textAlign;
                let fontStyle = "";
                if (this.fontItalic) fontStyle += "italic ";
                if (this.fontBold) fontStyle += "bold ";
                fontStyle += `${this.fontSize}px ${this.fontFamily}`;
                ctx.font = fontStyle;
                ctx.textBaseline = "top";

                console.log('Font style:', fontStyle, 'Color:', this.fontColor);

                if (!this.content) break;

                const lineHeight = 20;
                const maxWidth = this.width;
                const maxHeight = this.height;
                const words = this.content.split(/\s+/);
                let line = "";
                let y = this.y;

                // Coord x iniziale in base all’allineamento
                let startX = this.x;
                if (this.textAlign === "center") {
                    startX = this.x + this.width / 2;
                } else if (this.textAlign === "right") {
                    startX = this.x + this.width;
                }

                const linesToDraw: string[] = [];

                for (let n = 0; n < words.length; n++) {
                    let word = words[n];

                    // Spezzamento parola lunga
                    while (ctx.measureText(word).width > maxWidth) {
                        let fitLength = 1;
                        while (ctx.measureText(word.slice(0, fitLength)).width <= maxWidth && fitLength <= word.length) {
                            fitLength++;
                        }
                        fitLength--;

                        const part = word.slice(0, fitLength);
                        const rest = word.slice(fitLength);

                        if (line !== "") {
                            linesToDraw.push(line);
                            y += lineHeight;
                            if (y + lineHeight > this.y + maxHeight) break;
                            line = "";
                        }

                        linesToDraw.push(part);
                        y += lineHeight;
                        if (y + lineHeight > this.y + maxHeight) break;

                        word = rest;
                    }

                    const testLine = line === "" ? word : line + " " + word;
                    if (ctx.measureText(testLine).width > maxWidth) {
                        linesToDraw.push(line);
                        y += lineHeight;
                        if (y + lineHeight > this.y + maxHeight) break;
                        line = word;
                    } else {
                        line = testLine;
                    }
                }

                if (line !== "" && y + lineHeight <= this.y + maxHeight) {
                    linesToDraw.push(line);
                }

                y = this.y;
                linesToDraw.forEach((lineText, i) => {
                    ctx.fillText(lineText, startX, y);

                    // CURSORE solo su ultima linea
                    if (this.isEditing && this.cursorVisible && i === linesToDraw.length - 1) {
                        const cursorWidth = ctx.measureText(lineText).width;

                        let cursorX = startX;
                        if (this.textAlign === "left") {
                            cursorX = startX + cursorWidth;
                        } else if (this.textAlign === "center") {
                            cursorX = startX - cursorWidth / 2 + cursorWidth;
                        } else if (this.textAlign === "right") {
                            cursorX = startX - cursorWidth + cursorWidth;
                        }

                        ctx.beginPath();
                        ctx.moveTo(cursorX, y);
                        ctx.lineTo(cursorX, y + lineHeight);
                        ctx.strokeStyle = "#333";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    y += lineHeight;
                });

                break;

            case "image":
                if (!this.content) {
                    // Draw placeholder if no content available
                    ctx.fillStyle = "#f0f0f0";
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.strokeStyle = "#ccc";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                    
                    ctx.fillStyle = "#666";
                    ctx.font = "14px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("No Image", this.x + this.width/2, this.y + this.height/2);
                    break;
                }

                const cached = LayoutElement.imageCache.get(this.content);
                
                // Check if cache is still valid (not expired)
                const now = Date.now();
                if (cached && (now - cached.timestamp) < LayoutElement.CACHE_TTL) {
                    ctx.drawImage(cached.img, this.x, this.y, this.width, this.height);
                } else if (LayoutElement.failedImages.has(this.content)) {
                    // Show error state immediately for failed images
                    const errorImg = this.createErrorImage();
                    ctx.drawImage(errorImg, this.x, this.y, this.width, this.height);
                } else {
                    // Clear expired cache entry
                    if (cached) {
                        LayoutElement.imageCache.delete(this.content);
                    }
                    // Disegna placeholder mentre carica
                    ctx.fillStyle = "#f5f5f5";
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.strokeStyle = "#ddd";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                    
                    ctx.fillStyle = "#999";
                    ctx.font = "12px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("Loading...", this.x + this.width/2, this.y + this.height/2);
                    
                    // Only start loading if not already loading
                    if (!LayoutElement.loadingImages.has(this.content)) {
                        LayoutElement.loadingImages.add(this.content);
                        
                        // Show loading animation
                        ctx.fillStyle = "#f0f8ff";
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                        ctx.strokeStyle = "#4f46e5";
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.strokeRect(this.x, this.y, this.width, this.height);
                        ctx.setLineDash([]);
                        
                        ctx.fillStyle = "#4f46e5";
                        ctx.font = "12px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText("Loading...", this.x + this.width/2, this.y + this.height/2);
                        
                        const img = new Image();
                        img.crossOrigin = "anonymous"; // To avoid CORS issues
                        
                        // Add timeout for image loading to prevent hanging
                        const timeout = setTimeout(() => {
                            console.warn('Image loading timeout:', this.content);
                            img.src = ''; // Cancel the request
                            
                            // Create error placeholder immediately
                            const errorImg = this.createErrorImage();
                            LayoutElement.imageCache.set(this.content!, { 
                                img: errorImg, 
                                timestamp: Date.now() 
                            });
                            LayoutElement.loadingImages.delete(this.content!);
                            
                            const canvas = ctx.canvas;
                            const event = new CustomEvent('imageLoaded', { detail: { element: this } });
                            canvas.dispatchEvent(event);
                        }, 10000); // 10 second timeout
                        
                        img.onload = () => {
                            clearTimeout(timeout);
                            LayoutElement.imageCache.set(this.content!, { 
                                img: img, 
                                timestamp: Date.now() 
                            });
                            LayoutElement.loadingImages.delete(this.content!);
                            // Triggera un redraw del canvas parent se possibile
                            const canvas = ctx.canvas;
                            const event = new CustomEvent('imageLoaded', { detail: { element: this } });
                            canvas.dispatchEvent(event);
                        };
                        img.onerror = () => {
                            clearTimeout(timeout);
                            console.warn('Failed to load image:', this.content);
                            
                            // Mark image as failed and cache an error image
                            LayoutElement.failedImages.add(this.content!);
                            const errorImg = this.createErrorImage();
                            LayoutElement.imageCache.set(this.content!, { 
                                img: errorImg, 
                                timestamp: Date.now() 
                            });
                            LayoutElement.loadingImages.delete(this.content!);
                            
                            const canvas = ctx.canvas;
                            const event = new CustomEvent('imageLoaded', { detail: { element: this } });
                            canvas.dispatchEvent(event);
                        };
                        
                        img.src = this.content;
                    }
                }
                break;

            case "box":
                ctx.fillStyle = this.fillColor ?? "#007acc";
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
        }

        ctx.restore();
    }

    private createErrorImage(): HTMLImageElement {
        const errorImg = new Image();
        const errorCanvas = document.createElement('canvas');
        errorCanvas.width = this.width;
        errorCanvas.height = this.height;
        const errorCtx = errorCanvas.getContext('2d')!;
        
        errorCtx.fillStyle = "#ffebee";
        errorCtx.fillRect(0, 0, this.width, this.height);
        errorCtx.strokeStyle = "#f44336";
        errorCtx.lineWidth = 2;
        errorCtx.strokeRect(2, 2, this.width-4, this.height-4);
        
        errorCtx.fillStyle = "#f44336";
        errorCtx.font = "14px Arial";
        errorCtx.textAlign = "center";
        errorCtx.textBaseline = "middle";
        errorCtx.fillText("Error", this.width/2, this.height/2);
        
        errorImg.src = errorCanvas.toDataURL();
        return errorImg;
    }

    // Static method to clear image from cache (for when URL changes)
    static clearImageFromCache(url: string): void {
        LayoutElement.imageCache.delete(url);
        LayoutElement.loadingImages.delete(url);
        LayoutElement.failedImages.delete(url); // Give failed images another chance
    }

    // Static method to clear all cached images
    static clearAllImageCache(): void {
        LayoutElement.imageCache.clear();
        LayoutElement.loadingImages.clear();
        LayoutElement.failedImages.clear();
        console.log('Image cache cleared! All images will be reloaded.');
    }

    // Debug method to check cache status
    static debugImageCache(): void {
        console.log('=== IMAGE CACHE DEBUG ===');
        console.log('Cached images:', LayoutElement.imageCache.size);
        console.log('Loading images:', LayoutElement.loadingImages.size);
        console.log('Failed images:', LayoutElement.failedImages.size);
        console.log('Cache contents:', Array.from(LayoutElement.imageCache.keys()));
        console.log('Loading:', Array.from(LayoutElement.loadingImages));
        console.log('Failed:', Array.from(LayoutElement.failedImages));
        console.log('=========================');
    }

    contains(px: number, py: number): boolean {
        return (
        px >= this.x &&
        px <= this.x + this.width &&
        py >= this.y &&
        py <= this.y + this.height
        );
    }

    move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }
 }