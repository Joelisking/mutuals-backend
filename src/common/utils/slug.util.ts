/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Generate a unique slug by appending a timestamp or random string
 */
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
};

/**
 * Generate a slug with a counter for duplicates
 */
export const generateSlugWithCounter = (text: string, counter: number): string => {
  const baseSlug = generateSlug(text);
  return counter > 0 ? `${baseSlug}-${counter}` : baseSlug;
};
