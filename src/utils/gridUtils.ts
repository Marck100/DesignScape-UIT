// Grid management and validation utilities

/**
 * Snap a value to the grid
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
    if (isNaN(value)) return 0;
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Validate and correct dimensions respecting grid and minimum values
 */
export function validateDimension(value: number, minValue: number, gridSize: number = 20): number {
    const snapped = snapToGrid(value, gridSize);
    return Math.max(minValue, snapped);
}

/**
 * Validate and correct font size
 */
export function validateFontSize(fontSize: number): number {
    return Math.max(8, Math.min(72, Math.round(fontSize / 2) * 2));
}

/**
 * Handle custom increment for numeric controls
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
