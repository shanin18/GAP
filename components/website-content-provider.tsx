"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { sectionReader, type ContentSnapshot } from "@/lib/website-content";

const WebsiteContentContext = createContext<ContentSnapshot>({});

export function WebsiteContentProvider({
  content,
  children,
}: {
  content: ContentSnapshot;
  children: ReactNode;
}) {
  return (
    <WebsiteContentContext.Provider value={content}>
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContent(key: string) {
  const content = useContext(WebsiteContentContext);
  return useMemo(() => sectionReader(content[key]), [content, key]);
}
