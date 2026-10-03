import sources from './stock-image-sources.json';

/** Bundled source URLs: no runtime image lookup or extra API call. */
export function stockImage(key: string) {
  return sources.find(image => image.key === key)?.url;
}
