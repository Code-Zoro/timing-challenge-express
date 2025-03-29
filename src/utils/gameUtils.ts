
/**
 * Calculate the distance between two colors in RGB space
 * Lower values mean colors are more similar
 */
export function colorDistance(color1: string, color2: string): number {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 100; // Return a large distance if conversion fails
  
  // Calculate Euclidean distance
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Convert a hex color string to RGB object
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Calculate score based on color distance
 * Returns a score between 0-100, where 100 is a perfect match
 */
export function calculateColorScore(targetColor: string, selectedColor: string): number {
  const distance = colorDistance(targetColor, selectedColor);
  
  // Score calculation - inverse of distance with a cap
  // Max distance that we consider (pure black to pure white is ~442)
  const maxDistance = 442;
  const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
  
  // Convert to a 0-100 score (0 = worst, 100 = best)
  return Math.round((1 - normalizedDistance) * 100);
}

/**
 * Calculate score based on font selection accuracy
 * Returns 100 for correct answer, 0 for incorrect
 */
export function calculateFontScore(targetFont: string, selectedFont: string): number {
  return targetFont === selectedFont ? 100 : 0;
}

/**
 * Calculate the final score based on accuracy and timing
 * @param accuracy Score from 0-100 for accuracy
 * @param timing Time difference from target in ms (lower is better)
 * @returns Final score from 0-100
 */
export function calculateFinalScore(accuracy: number, timing: number): number {
  // Weight accuracy more than timing
  const accuracyWeight = 0.7;
  const timingWeight = 0.3;
  
  // For timing, we want 0 ms difference to be perfect, and >1000ms to be worst
  const maxTimingDifference = 1000;
  const normalizedTiming = Math.min(timing, maxTimingDifference) / maxTimingDifference;
  const timingScore = (1 - normalizedTiming) * 100;
  
  // Calculate weighted final score
  return Math.round((accuracy * accuracyWeight) + (timingScore * timingWeight));
}
