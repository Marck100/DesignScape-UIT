// Undo/redo functionality and keyboard shortcuts management

import { DesignCanvas } from "../core/canvas";

/**
 * Manages undo/redo operations through UI buttons and keyboard shortcuts.
 * Provides visual feedback and maintains history state synchronization.
 */
export class HistoryManager {
    private dc: DesignCanvas;

    /**
     * Creates a new HistoryManager instance
     * @param canvas - The design canvas to manage history for
     */
    constructor(canvas: DesignCanvas) {
        this.dc = canvas;
        this.setupUndoRedoButtons();
        this.setupKeyboardShortcuts();
        this.setupHistoryCallbacks();
    }

    /**
     * Sets up event listeners for undo/redo buttons
     */
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
