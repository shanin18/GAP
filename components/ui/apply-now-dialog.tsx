"use client";
import { lazy, Suspense, useState } from "react";
import { useWebsiteContent } from "@/components/website-content-provider";
import { Button } from "./button";

// The form brings validation, Radix dialog/select and Turnstile. This button is on every page,
// so fetch the form only when a visitor shows intent (hover, focus or click).
const loadDialog = () => import("./enquiry-dialog");
const EnquiryDialog = lazy(loadDialog);

export function ApplyNowDialog({
  triggerClass = "",
  inline = false,
  initialCountry = "",
}: {
  triggerClass?: string;
  inline?: boolean;
  initialCountry?: string;
}) {
  const t = useWebsiteContent("enquiry-form");
  // null until the first open; afterwards the loaded dialog manages its own trigger
  const [open, setOpen] = useState<boolean | null>(inline ? true : null);
  const trigger = (busy: boolean) => (
    <Button
      className={triggerClass}
      aria-haspopup="dialog"
      aria-busy={busy || undefined}
      onPointerEnter={loadDialog}
      onFocus={loadDialog}
      onClick={() => setOpen(true)}
    >
      {t("Book an appointment")}
    </Button>
  );
  if (open === null) return trigger(false);
  return (
    <Suspense fallback={inline ? null : trigger(true)}>
      <EnquiryDialog
        inline={inline}
        open={open}
        onOpenChange={setOpen}
        triggerClass={triggerClass}
        initialCountry={initialCountry}
      />
    </Suspense>
  );
}
