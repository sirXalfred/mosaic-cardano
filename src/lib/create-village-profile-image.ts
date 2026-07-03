export function createVillageProfileImage(name: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'mosaic')}`;
}
