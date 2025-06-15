export function initCanvas() {
    const canvas = document.getElementById("design-canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw Error("Cannot render canvas");
    }
    ctx.fillStyle = "#ff6f61";
    ctx.fillRect(100, 100, 200, 100);
    ctx.fillStyle = "white";
    ctx.fillText("Testo", 130, 160);
}
