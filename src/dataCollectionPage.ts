// dataCollectionPage.ts
// Interfaccia alternativa per creare layout a mano e salvarne versioni migliorate per addestramento

import { LayoutElement, TextAlign } from "./layoutElement";
import { DesignCanvas } from "./DesignCanvas";

const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
const designCanvas = new DesignCanvas(canvasEl);

const saveBtn = document.getElementById("save-layout") as HTMLButtonElement;
const versionBtn = document.getElementById("save-variant") as HTMLButtonElement;

let savedBase: LayoutElement[] = [];
let savedVariants: LayoutElement[][] = [];

saveBtn.addEventListener("click", () => {
  savedBase = designCanvas.exportLayout();
  alert("Layout iniziale salvato!");
});

versionBtn.addEventListener("click", () => {
  if (savedBase.length === 0) {
    alert("Salva prima il layout base.");
    return;
  }
  const variant = designCanvas.exportLayout();
  savedVariants.push(variant);
  alert(`Variante ${savedVariants.length} salvata.`);
});

// Esporta tutto in JSON per addestramento
const downloadBtn = document.getElementById("download-data") as HTMLButtonElement;
downloadBtn.addEventListener("click", () => {
  const dataset = savedVariants.map(variant => ({
    input: savedBase.map(el => el.toSerializable()),
    output: variant.map(el => el.toSerializable())
  }));

  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "layout_dataset.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Estensione DesignCanvas per esportare layout
DesignCanvas.prototype.exportLayout = function (): LayoutElement[] {
  return this.elements.map(el => new LayoutElement({
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    type: el.type,
    content: el.content,
    fontSize: el.fontSize,
    fontBold: el.fontBold,
    fontItalic: el.fontItalic,
    fontColor: el.fontColor,
    fontFamily: el.fontFamily,
    textAlign: el.textAlign,
    fillColor: el.fillColor
  }));
};

// Estensione LayoutElement per serializzazione
LayoutElement.prototype.toSerializable = function (): object {
  return {
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    type: this.type,
    content: this.content ?? null,
    fontSize: this.fontSize,
    fontBold: this.fontBold,
    fontItalic: this.fontItalic,
    fontColor: this.fontColor,
    fontFamily: this.fontFamily,
    textAlign: this.textAlign,
    fillColor: this.fillColor
  };
};

// HTML necessario:
// <button id="save-layout">Salva layout iniziale</button>
// <button id="save-variant">Salva versione migliorata</button>
// <button id="download-data">Scarica JSON</button>
// <canvas id="canvas" width="1000" height="600"></canvas>
// <select id="element-type">...</select>
// <button id="add-element">Aggiungi</button>
// <div id="text-settings-panel">...</div>
// <div id="box-color-panel">...</div>

// Comportamento per aggiunta elementi come nella pagina main
const typeSelector = document.getElementById("element-type") as HTMLSelectElement;
const addButton = document.getElementById("add-element") as HTMLButtonElement;

addButton.addEventListener("click", () => {
  const type = typeSelector.value;

  let content: string = "";
  if (type === "text") {
    content = prompt("Inserisci il testo:") ?? "";
    if (content === null) return;
  }
  if (type === "image") {
    content = prompt("Inserisci URL immagine:") ?? "";
    if (!content || content.trim() === "") return;
  }

  designCanvas.addElement(new LayoutElement({
    x: 200,
    y: 200,
    width: type === "text" ? 200 : 150,
    height: type === "text" ? 40 : 100,
    type: type as "box" | "text" | "image",
    content
  }));
});

const textSettingsPanel = document.getElementById("text-settings-panel")!;
const fontFamilySelect = document.getElementById("font-family") as HTMLSelectElement;
const textAlignSelect = document.getElementById("text-align") as HTMLSelectElement;
const fontSizeInput = document.getElementById("font-size") as HTMLInputElement;
const fontColorInput = document.getElementById("font-color") as HTMLInputElement;
const fontBoldCheckbox = document.getElementById("font-bold") as HTMLInputElement;
const fontItalicCheckbox = document.getElementById("font-italic") as HTMLInputElement;

const colorPanel = document.getElementById("box-color-panel")!;
const colorInput = document.getElementById("box-color") as HTMLInputElement;

designCanvas.onElementSelected = (el) => {
  if (el && el.type === "box") {
    colorInput.value = el.fillColor ?? "#007acc";
    colorPanel.style.display = "block";
    textSettingsPanel.style.display = "none";
  } else if (el?.type === "text") {
    textSettingsPanel.style.display = "block";
    colorPanel.style.display = "none";

    fontFamilySelect.value = el.fontFamily;
    textAlignSelect.value = el.textAlign;
    fontSizeInput.value = el.fontSize.toString();
    fontColorInput.value = el.fontColor;
    fontBoldCheckbox.checked = el.fontBold;
    fontItalicCheckbox.checked = el.fontItalic;
  } else {
    colorPanel.style.display = "none";
    textSettingsPanel.style.display = "none";
  }
};

colorInput.addEventListener("input", () => {
  const sel = designCanvas["selectedElement"];
  if (sel && sel.type === "box") {
    sel.fillColor = colorInput.value;
    designCanvas["draw"]();
  }
});

function updateSelectedTextElement() {
  const sel = designCanvas["selectedElement"];
  if (sel && sel.type === "text") {
    sel.fontFamily = fontFamilySelect.value;
    // Only allow values that are valid for your TextAlign type
    const allowedTextAligns: TextAlign[] = ["left", "center", "right"];
    const selectedAlign = textAlignSelect.value;
    sel.textAlign = allowedTextAligns.includes(selectedAlign as TextAlign)
      ? (selectedAlign as TextAlign)
      : "left";
    sel.fontSize = parseInt(fontSizeInput.value);
    sel.fontColor = fontColorInput.value;
    sel.fontBold = fontBoldCheckbox.checked;
    sel.fontItalic = fontItalicCheckbox.checked;
    designCanvas["draw"]();
  }
}

fontFamilySelect.addEventListener("change", updateSelectedTextElement);
textAlignSelect.addEventListener("change", updateSelectedTextElement);
fontSizeInput.addEventListener("input", updateSelectedTextElement);
fontColorInput.addEventListener("input", updateSelectedTextElement);
fontBoldCheckbox.addEventListener("change", updateSelectedTextElement);
fontItalicCheckbox.addEventListener("change", updateSelectedTextElement);
