export type ContentEntry = { key: string; value?: string | null };
export type ContentSection = {
  key: string;
  enabled?: boolean | null;
  sortOrder?: number | null;
  entries?: ContentEntry[] | null;
};
export type ContentSnapshot = Record<string, ContentSection>;

export function contentKey(text: string) {
  let hash = 2166136261;
  for (const char of text.trim().replace(/\s+/g, " "))
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `copy_${(hash >>> 0).toString(36)}`;
}

/** Empty strings intentionally clear copy; missing values retain the original text. */
export function sectionReader(section?: ContentSection) {
  const entries = new Map(
    section?.entries?.map((entry) => [entry.key, entry.value]),
  );
  return (
    fallback: string | null | undefined,
    defaultValue = fallback,
  ): string => {
    if (fallback == null) return "";
    const value = entries.get(contentKey(fallback));
    if (value == null) return defaultValue ?? "";
    if (!value) return "";
    return (
      (fallback.match(/^\s+/)?.[0] ?? "") +
      value.trim() +
      (fallback.match(/\s+$/)?.[0] ?? "")
    );
  };
}
