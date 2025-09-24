// Shared utility functions for element management and creation

import { LayoutElement } from "../core/element";
import { ElementType } from "../types/element";

/**
 * Default configuration for new elements including position and sizes
 * Used when creating elements without specific positioning
 */
export const DEFAULT_ELEMENT_CONFIG = {
  position: { x: 200, y: 200 },          // Default placement position
  sizes: {
    box: { width: 150, height: 100 },    // Default box dimensions
    text: { width: 200, height: 40 },    // Default text area dimensions
    image: { width: 150, height: 100 }   // Default image dimensions
  }
};

/**
 * Creates a new element with default configuration based on type
 * @param type - The type of element to create
 * @param content - Optional content for the element
 * @returns New LayoutElement instance with default properties
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
 * Validates if a URL is valid for image elements
 * @param url - URL string to validate
 * @returns True if URL is valid, false otherwise
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
 * Validates text content for text elements
 * @param text - Text string to validate
 * @returns True if text is valid, false otherwise
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
