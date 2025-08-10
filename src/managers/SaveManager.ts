// Project saving, export and auto-save functionality

import { DesignCanvas } from "../core/canvas";

export class SaveManager {
    private dc: DesignCanvas;
    private autoSaveTimer: number = 0;
    private readonly AUTO_SAVE_DELAY = 5000;

    constructor(canvas: DesignCanvas) {
        this.dc = canvas;
        this.setupSaveButtons();
        this.loadSavedProject();
    }

    private setupSaveButtons(): void {
        const saveBtn = document.getElementById("save-project");
        const exportBtn = document.getElementById("export-project");

        saveBtn?.addEventListener("click", () => this.saveProject());
        exportBtn?.addEventListener("click", () => this.exportProject());
    }

    private saveProject(): void {
        const layout = this.dc.exportLayout();
        const dataStr = JSON.stringify(layout, null, 2);
        localStorage.setItem('designscope-project', dataStr);
        
        this.showFeedback("save-project", "Saved!");
    }

    private exportProject(): void {
        const layout = this.dc.exportLayout();
        const dataStr = JSON.stringify(layout, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "designscape-layout.json";
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback("export-project", "Exported!");
    }

    private showFeedback(buttonId: string, message: string): void {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="material-icons">check</span>${message}`;
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }

    autoSave(): void {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = window.setTimeout(() => {
            const layout = this.dc.exportLayout();
            localStorage.setItem('designscope-autosave', JSON.stringify(layout));
        }, this.AUTO_SAVE_DELAY);
    }

    private loadSavedProject(): void {
        const savedProject = localStorage.getItem('designscope-project');
        if (savedProject) {
            try {
                const layout = JSON.parse(savedProject);
                // Could add a confirmation dialog here in the future
            } catch (e) {
                console.warn('Could not load saved project:', e);
            }
        }
    }
}
