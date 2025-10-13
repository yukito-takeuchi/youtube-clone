/**
 * Default image URLs for profile icons and banners
 * These are used when a user hasn't uploaded custom images
 */

const DEFAULT_ICON_URL = process.env.NEXT_PUBLIC_DEFAULT_ICON_URL || 'https://api.dicebear.com/7.x/initials/svg?seed=User';
const DEFAULT_BANNER_URL = process.env.NEXT_PUBLIC_DEFAULT_BANNER_URL || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=400&fit=crop';

/**
 * Returns the icon URL, or the default icon URL if the provided URL is empty
 * @param iconUrl - The user's icon URL (may be empty/null/undefined)
 * @returns The icon URL to display
 */
export function getIconUrl(iconUrl?: string | null): string {
  return iconUrl && iconUrl.trim() !== '' ? iconUrl : DEFAULT_ICON_URL;
}

/**
 * Returns the banner URL, or the default banner URL if the provided URL is empty
 * @param bannerUrl - The user's banner URL (may be empty/null/undefined)
 * @returns The banner URL to display
 */
export function getBannerUrl(bannerUrl?: string | null): string {
  return bannerUrl && bannerUrl.trim() !== '' ? bannerUrl : DEFAULT_BANNER_URL;
}
