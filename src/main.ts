import { DesignCanvas } from "./DesignCanvas";
import { LayoutElement } from "./layoutElement";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
  const dc = new DesignCanvas(canvas);

  // Aggiunta di elementi
  dc.addElement(new LayoutElement({ x: 100, y: 100, width: 200, height: 100, type: "box" }));
  dc.addElement(new LayoutElement({ x: 350, y: 200, width: 250, height: 60, type: "text", content: "DesignScape" }));
});
