// Shared utility functions for element management

import { LayoutElement } from "../core/element";
import { ElementType } from "../types/element";

/**
 * Default configuration for new elements
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
 * Creates a new element with default configuration
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
 * Validates a URL for images
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
 * Validates text for text elements
 */
export function isValidText(text: string): boolean {
  return text !== null && text.trim() !== "";
}

/**
 * Prompts the user to enter content for an element
 */
export function promptForElementContent(type: ElementType): string | null {
  switch (type) {
    case "text":
      // Return placeholder text instead of prompting
      return "Double-click to edit";
      
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
