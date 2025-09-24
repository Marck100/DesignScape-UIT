// Grid management and validation utilities for layout alignment

/**
 * Snaps a value to the nearest grid point for consistent alignment
 * @param value - The value to snap to grid
 * @param gridSize - Size of grid cells (default: 10)
 * @returns Value snapped to nearest grid point
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
    if (isNaN(value)) return 0;
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Validates and corrects dimensions with grid snapping and minimum constraints
 * @param value - The dimension value to validate
 * @param minValue - Minimum allowed value
 * @param gridSize - Grid size for snapping (default: 20)
 * @returns Validated dimension respecting grid and minimum constraints
 */
export function validateDimension(value: number, minValue: number, gridSize: number = 20): number {
    const snapped = snapToGrid(value, gridSize);
    return Math.max(minValue, snapped);
}

/**
 * Validates and constrains font size within reasonable bounds
 * @param fontSize - Font size to validate
 * @returns Font size clamped between 8 and 72, rounded to even numbers
 */
export function validateFontSize(fontSize: number): number {
    return Math.max(8, Math.min(72, Math.round(fontSize / 2) * 2));
}

/**
 * Calculates incremented values for numeric controls with grid awareness
 * @param currentValue - Current value
 * @param direction - Direction of change (1 for increase, -1 for decrease)
 * @param isDimension - Whether this is a dimension that needs minimum constraints
 * @param minValue - Minimum value for dimensions (default: 20)
 * @param gridSize - Grid size for incrementing (default: 20)
 * @returns New value after increment with appropriate constraints
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
