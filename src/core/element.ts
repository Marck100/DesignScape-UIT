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

    resizeHandleSize: number = 8;

    isEditing: boolean = false;
    cursorVisible: boolean = false;

    fontFamily: string = "Arial";
    fontSize: number = 20;
    fontColor: string = "#333";
    fontBold: boolean = false;
    fontItalic: boolean = false;
    textAlign: TextAlign = "left";

    
    imageCache: Map<string, HTMLImageElement> = new Map();
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
        const size = this.resizeHandleSize;
        return [
            { x: this.x, y: this.y },                             // top-left
            { x: this.x + this.width, y: this.y },                // top-right
            { x: this.x, y: this.y + this.height },               // bottom-left
            { x: this.x + this.width, y: this.y + this.height }   // bottom-right
        ];
    }


    getResizeHandle(px: number, py: number): number | null {
        const size = this.resizeHandleSize
        const margin = 8; 
        const handles = this.getResizeHandles();

        console.log('px', px)
        console.log('py', py)
        console.log(handles)
        for (let i = 0; i < handles.length; i++) {
            const h = handles[i];
            if (
            px >= h.x - margin &&
            px <= h.x + size + margin &&
            py >= h.y - margin &&
            py <= h.y + size + margin
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

            // Handle di ridimensionamento eleganti
            ctx.fillStyle = "#667eea";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            
            for (const h of this.getResizeHandles()) {
                // Handle principale
                ctx.fillRect(
                    h.x - this.resizeHandleSize / 2,
                    h.y - this.resizeHandleSize / 2,
                    this.resizeHandleSize,
                    this.resizeHandleSize
                );
                
                // White border for contrast
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

                const cached = this.imageCache.get(this.content);
                
                if (cached) {
                    ctx.drawImage(cached, this.x, this.y, this.width, this.height);
                } else {
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
                    
                    const img = new Image();
                    img.crossOrigin = "anonymous"; // To avoid CORS issues
                    img.src = this.content;
                    img.onload = () => {
                        this.imageCache.set(this.content!, img);
                        // Triggera un redraw del canvas parent se possibile
                        const canvas = ctx.canvas;
                        const event = new CustomEvent('imageLoaded', { detail: { element: this } });
                        canvas.dispatchEvent(event);
                    };
                    img.onerror = () => {
                        console.warn('Failed to load image:', this.content);
                        // Cache an error image
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
                        this.imageCache.set(this.content!, errorImg);
                        
                        const canvas = ctx.canvas;
                        const event = new CustomEvent('imageLoaded', { detail: { element: this } });
                        canvas.dispatchEvent(event);
                    };
                }
                break;

            case "box":
                ctx.fillStyle = this.fillColor ?? "#007acc";
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
        }

        ctx.restore();
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