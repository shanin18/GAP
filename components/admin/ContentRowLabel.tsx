"use client";
import { useRowLabel } from "@payloadcms/ui";

export function ContentRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; value?: string }>();
  return <span>{data.label || `Content ${(rowNumber ?? 0) + 1}`}</span>;
}
