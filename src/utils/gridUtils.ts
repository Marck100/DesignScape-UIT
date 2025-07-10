// src/utils/gridUtils.ts
// Utilità per la gestione della griglia e validazione

/**
 * Snappa un valore alla griglia
 */
export function snapToGrid(value: number, gridSize: number = 20): number {
    if (isNaN(value)) return 0;
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Valida e corregge le dimensioni rispettando la griglia e i valori minimi
 */
export function validateDimension(value: number, minValue: number, gridSize: number = 20): number {
    const snapped = snapToGrid(value, gridSize);
    return Math.max(minValue, snapped);
}

/**
 * Valida e corregge la dimensione del font
 */
export function validateFontSize(fontSize: number): number {
    return Math.max(8, Math.min(72, Math.round(fontSize / 2) * 2));
}

/**
 * Gestisce l'incremento personalizzato per i controlli numerici
 */
export function calculateIncrementValue(
    currentValue: number, 
    direction: number, 
    isDimension: boolean, 
    minValue: number = 20,
    gridSize: number = 20
): number {
    if (isDimension) {
        return Math.max(minValue, currentValue + (direction * gridSize));
    } else {
        return currentValue + (direction * gridSize);
    }
}
