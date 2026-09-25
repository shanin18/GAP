"use client";

import { PublishButton, SaveButton, SaveDraftButton } from "@payloadcms/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function FormActions() {
  return <div className="gap-form-actions" data-gap-form-actions />;
}

// Keep Payload's permission checks, submission state and keyboard shortcuts.
// Scope the destination to this form so relationship drawers work independently.
function BottomAction({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    setTarget(form?.querySelector<HTMLElement>("[data-gap-form-actions]") ?? null);
  }, []);

  return (
    <>
      <span hidden ref={marker} />
      {target ? createPortal(children, target) : children}
    </>
  );
}

export function BottomSaveButton() {
  return <BottomAction><SaveButton /></BottomAction>;
}

export function BottomSaveDraftButton() {
  return <BottomAction><SaveDraftButton /></BottomAction>;
}

export function BottomPublishButton() {
  return <BottomAction><PublishButton /></BottomAction>;
}
