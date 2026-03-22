/**
 * Utility functions for handling product variants
 */

/**
 * Compare two variant objects for equality
 * Handles null/undefined cases and compares properties properly
 * @param variant1 First variant object
 * @param variant2 Second variant object
 * @returns true if variants match, false otherwise
 */
export const variantsMatch = (variant1: any, variant2: any): boolean => {
  console.log('variantsMatch called with:', { variant1, variant2 });
  
  // Normalize empty objects and null/undefined to null
  const normalize = (variant: any) => {
    if (!variant || (typeof variant === 'object' && Object.keys(variant).length === 0)) {
      return null;
    }
    return variant;
  };

  const normalized1 = normalize(variant1);
  const normalized2 = normalize(variant2);
  
  console.log('Normalized variants:', { normalized1, normalized2 });

  // Handle null/undefined cases after normalization
  if (!normalized1 && !normalized2) {
    console.log('Both variants are null/empty, returning true');
    return true;
  }
  if (!normalized1 || !normalized2) {
    console.log('One variant is null/empty, other is not, returning false');
    return false;
  }
  
  // Compare each property
  const keys1 = Object.keys(normalized1);
  const keys2 = Object.keys(normalized2);
  
  if (keys1.length !== keys2.length) {
    console.log('Different number of keys, returning false');
    return false;
  }
  
  const result = keys1.every(key => normalized1[key] === normalized2[key]);
  console.log('Property comparison result:', result);
  return result;
};