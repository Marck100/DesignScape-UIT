// Undo/redo functionality and keyboard shortcuts

import { DesignCanvas } from "../core/canvas";

export class HistoryManager {
    private dc: DesignCanvas;

    constructor(canvas: DesignCanvas) {
        this.dc = canvas;
        this.setupUndoRedoButtons();
        this.setupKeyboardShortcuts();
        this.setupHistoryCallbacks();
    }

    private setupUndoRedoButtons(): void {
        const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement;
        const redoBtn = document.getElementById("redo-btn") as HTMLButtonElement;

        undoBtn?.addEventListener("click", () => {
            if (this.dc.undo()) {
                this.showFeedback(undoBtn);
            }
        });

        redoBtn?.addEventListener("click", () => {
            if (this.dc.redo()) {
                this.showFeedback(redoBtn);
            }
        });
    }

    private setupKeyboardShortcuts(): void {
        document.addEventListener("keydown", (e) => {
            // Undo: Ctrl+Z (or Cmd+Z on Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (this.dc.canUndo()) {
                    this.dc.undo();
                }
            }
            
            // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Y/Cmd+Shift+Z on Mac)
            if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                if (this.dc.canRedo()) {
                    this.dc.redo();
                }
            }
        });
    }

    private setupHistoryCallbacks(): void {
        const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement;
        const redoBtn = document.getElementById("redo-btn") as HTMLButtonElement;

        this.dc.onHistoryChange = (canUndo: boolean, canRedo: boolean) => {
            if (undoBtn) undoBtn.disabled = !canUndo;
            if (redoBtn) redoBtn.disabled = !canRedo;
        };
    }

    private showFeedback(button: HTMLButtonElement): void {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="material-icons">check</span>';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 500);
    }
}
