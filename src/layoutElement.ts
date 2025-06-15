export type ElementType = "text" | "image" | "box";

export interface LayoutElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;

    type: ElementType;
    content?: string;
};

export class LayoutElement {
    x: number;
    y: number;
    width: number;
    height: number;
    type: ElementType;
    content?: string;
    isSelected: boolean = false;

    resizeHandleSize: number = 8;

    constructor(options: LayoutElementOptions) {
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.type = options.type;
        this.content = options.content;
    }

    getResizeHandles(): {x: number, y: number}[] {
        const size = this.resizeHandleSize;
        return [
            { x: this.x - size/2, y: this.y - size/2 },
            { x: this.x + this.width - size/2, y: this.y - size/2 },
            { x: this.x - size/2, y: this.y + this.height - size/2 },
            { x: this.x + this.width - size/2, y: this.y + this.height - size/2 }
        ];
    }

    getResizeHandle(px: number, py: number): number | null {
        const size = this.resizeHandleSize
        const margin = 12; 
        const handles = this.getResizeHandles();

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
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);

            for (const h of this.getResizeHandles()) {
                ctx.fillRect(h.x, h.y, this.resizeHandleSize, this.resizeHandleSize);
            }
        }

        switch (this.type) {
            case "text":
                ctx.fillStyle = "#333";
                ctx.font = "20px sans-serif";
                ctx.fillText(this.content || "", this.x, this.y + 20);
                break;

            case "image":
                if (this.content) {
                    const img = new Image();
                    img.src = this.content;
                    img.onload = () => {
                        ctx.drawImage(img, this.x, this.y, this.width, this.height);
                    };
                }
                break;

            case "box":
                ctx.fillStyle = "#007acc";
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