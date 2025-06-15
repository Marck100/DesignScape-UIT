import { LayoutElement } from "./layoutElement";

export class DesignCanvas {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private elements: LayoutElement[] = [];
    private selectedElement: LayoutElement | null = null;

    private isDragging: boolean = false;
    private offsetX = 0;
    private offsetY = 0;

    private resizingHandleIndex: number | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext("2d");

        if (!context) {
            throw Error("Cannot get context");
        }
        this.ctx = context;

        this.initListeners();
        this.draw();
    }

    addElement(element: LayoutElement) {
        this.elements.push(element);
        this.draw()
    }

    private initListeners() {
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("dblclick", this.onDoubleClick.bind(this));
    }

    private onMouseDown(e: MouseEvent) {
        const {x, y} = this.getMousePosition(e);

        this.selectedElement = this.elements.find(el => el.contains(x, y)) || null;
        this.elements.forEach(el => (el.isSelected = el === this.selectedElement));

        if (this.selectedElement) {
            const handleIndex = this.selectedElement.getResizeHandle(x, y);
            if (handleIndex !== null) {
                this.resizingHandleIndex = handleIndex;
            } else {
                this.isDragging = true;
                this.offsetX = x - this.selectedElement.x;
                this.offsetY = y - this.selectedElement.y;
            }
        }

        this.draw();
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.selectedElement) {
            return;
        }

        const {x, y} = this.getMousePosition(e);

        if (this.resizingHandleIndex !== null) {
            const ex = this.selectedElement;
           
            switch (this.resizingHandleIndex) {
                case 0: // top-left
                ex.width += ex.x - x;
                ex.height += ex.y - y;
                ex.x = x;
                ex.y = y;
                break;
                case 1: // top-right
                    ex.width = x - ex.x;
                    ex.height += ex.y - y;
                    ex.y = y;
                    break;
                case 2: // bottom-left
                    ex.width += ex.x - x;
                    ex.x = x;
                    ex.height = y - ex.y;
                    break;
                case 3: // bottom-right
                    ex.width = x - ex.x;
                
                    ex.height = y - ex.y;
                    break;
            }
        } else if (this.isDragging) {
            this.selectedElement.x = x - this.offsetX;
            this.selectedElement.y = y - this.offsetY;
        }

    
        this.draw();
    }

    private onMouseUp(e: MouseEvent) {
        this.isDragging = false;
        this.resizingHandleIndex = null;
    }

    private onDoubleClick(e: MouseEvent) {
        const {x, y} = this.getMousePosition(e);
        const target = this.elements.find(el => el.contains(x, y) && el.type === "text");

        if (target) {
            const newText = prompt("Enter the new text:", target.content ?? "");

            if (newText !== null) {
                target.content = newText;
                this.draw();
            }
        }

    }

    private getMousePosition(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const el of this.elements) {
            el.draw(this.ctx);
        }
    }
}