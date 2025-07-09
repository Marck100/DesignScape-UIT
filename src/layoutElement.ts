export type ElementType = "text" | "image" | "box";
export type TextAlign = "left" | "center" | "right";

export interface LayoutElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;

    type: ElementType;
    content?: string;
    fillColor?: string; 

    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    fontBold?: boolean;
    fontItalic?: boolean;

    textAlign?: TextAlign 

    
};

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
            // Bordo principale elegante blu-viola (come il tema del progetto)
            ctx.strokeStyle = "#667eea";
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);

            // Bordo esterno sottile per contrasto
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
                
                // Bordo bianco per contrasto
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
                if (!this.content) break;

                const cached = this.imageCache.get(this.content);
                
                if (cached) {
                    ctx.drawImage(cached, this.x, this.y, this.width, this.height);
                } else {
                    const img = new Image();
                    img.src = this.content;
                    img.onload = () => {
                    this.imageCache.set(this.content!, img);
                    ctx.drawImage(img, this.x, this.y, this.width, this.height);
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