// src/utils/colorGeneration.ts
export function generateColorFromAddress(address: string): string {
    // Create a hash from the wallet address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = ((hash << 5) - hash) + address.charCodeAt(i);
      hash = hash & hash;
    }
  
    // Predefined color palette for consistent, visually pleasing colors
    const colorPalette = [
      '#E5F6FD', // Light Blue
      '#FDE5E5', // Light Red
      '#E5FDE8', // Light Green
      '#F9E5FD', // Light Purple
      '#FDF6E5', // Light Yellow
      '#E5EDFD', // Light Indigo
      '#FDE5F6', // Light Pink
      '#E5FDF9', // Light Teal
      '#F6E5FD', // Light Violet
      '#FDEEE5'  // Light Orange
    ];
  
    // Use the hash to select a color from the palette
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  }