// src/utils/elementUtils.ts
// Funzioni di utilità condivise per la gestione degli elementi

import { LayoutElement } from "../core/element";
import { ElementType } from "../types/element";

/**
 * Configurazione di default per i nuovi elementi
 */
export const DEFAULT_ELEMENT_CONFIG = {
  position: { x: 200, y: 200 },
  sizes: {
    box: { width: 150, height: 100 },
    text: { width: 200, height: 40 },
    image: { width: 150, height: 100 }
  }
};

/**
 * Crea un nuovo elemento con configurazione di default
 */
export function createDefaultElement(type: ElementType, content: string = ""): LayoutElement {
  const config = DEFAULT_ELEMENT_CONFIG;
  
  return new LayoutElement({
    x: config.position.x,
    y: config.position.y,
    width: config.sizes[type].width,
    height: config.sizes[type].height,
    type,
    content
  });
}

/**
 * Valida un URL per le immagini
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida il testo per gli elementi di testo
 */
export function isValidText(text: string): boolean {
  return text !== null && text.trim() !== "";
}

/**
 * Chiede all'utente di inserire contenuto per un elemento
 */
export function promptForElementContent(type: ElementType): string | null {
  switch (type) {
    case "text":
      const text = prompt("Inserisci il testo:") ?? "";
      return isValidText(text) ? text : null;
      
    case "image":
      const url = prompt("Inserisci URL immagine:") ?? "";
      if (!isValidImageUrl(url)) {
        alert("URL non valido!");
        return null;
      }
      return url;
      
    case "box":
    default:
      return "";
  }
}
