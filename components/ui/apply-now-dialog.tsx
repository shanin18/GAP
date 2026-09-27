"use client";
import { useDestinations } from "../destinations-provider";
import { useWebsiteContent } from "@/components/website-content-provider";

import { type FormEvent, type ReactNode, useId, useRef, useState } from "react";
import { leadSchema } from "@/lib/validations/lead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "./dialog";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  interestedCountry: "",
  message: "",
};

export function ApplyNowDialog({
  triggerClass = "",
  triggerContent = "Apply Now",
}: {
  triggerClass?: string;
  triggerContent?: ReactNode;
}) {
  const t = useWebsiteContent("enquiry-form");
  const destinations = useDestinations();

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({});
  const errorPrefix = useId();
  const submitting = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  function updateField(field: keyof typeof initialForm, value: string) {
    if (submitting.current) return;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const result = leadSchema.shape[field].safeParse(value);
      return { ...current, [field]: result.success ? undefined : result.error.issues[0]?.message };
    });
    if (status !== "idle") setStatus("idle");
    setError("");
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const parsed = leadSchema.safeParse({ ...form, sourcePage: window.location.pathname });
    if (!parsed.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof initialForm;
        if (field in initialForm && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      setError("");
      setStatus("idle");
      const first = Object.keys(errors)[0];
      event.currentTarget.querySelector<HTMLElement>(`[data-lead-field="${first}"]`)?.focus();
      return;
    }
    submitting.current = true;
    setFieldErrors({});
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true)
        throw new Error(result.error || "Unable to submit your request.");
      setStatus("success");
      setForm(initialForm);
    } catch (submissionError) {
      setStatus("error");
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your request.",
      );
    } finally {
      submitting.current = false;
    }
  }

  function validationProps(field: keyof typeof initialForm) {
    return {
      "data-lead-field": field,
      "aria-invalid": Boolean(fieldErrors[field]),
      "aria-describedby": fieldErrors[field] ? `${errorPrefix}-${field}` : undefined,
      disabled: status === "loading",
    };
  }

  function fieldError(field: keyof typeof initialForm) {
    return fieldErrors[field] ? <p id={`${errorPrefix}-${field}`} role="alert" className="text-sm text-red-600">{fieldErrors[field]}</p> : null;
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (open && status === "success") {
        setStatus("idle");
        setError("");
        setFieldErrors({});
      }
    }}>
      <DialogTrigger asChild>
        <Button className={triggerClass}>
          {typeof triggerContent === "string"
            ? t(triggerContent)
            : triggerContent}
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          // Announce the dialog before entering the form, without opening the mobile keyboard.
          event.preventDefault();
          titleRef.current?.focus({ preventScroll: true });
        }}
      >
        {status === "success" ? (
          <div className="grid gap-4 py-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <DialogTitle
              ref={titleRef}
              tabIndex={-1}
              className="font-display text-4xl tracking-tight focus:outline-none"
            >
              {t("You’re on your way.")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("Thanks for reaching out. Our team will contact you shortly.")}
            </DialogDescription>
          </div>
        ) : (
          <>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Apply now")}
            </p>
            <DialogTitle
              ref={titleRef}
              tabIndex={-1}
              className="font-display text-4xl tracking-tight focus:outline-none"
            >
              {t("Start your journey.")}
            </DialogTitle>
            <DialogDescription className="mt-3 text-muted-foreground">
              {t("Tell us a little about your study-abroad plans.")}
            </DialogDescription>
            <form noValidate onSubmit={submitLead} className="mt-7 grid gap-4">
              <Input
                {...validationProps("name")}
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-label={t("Full name")}
                placeholder={t("Full name")}
              />
              {fieldError("name")}
              <Input
                {...validationProps("email")}
                name="email"
                autoComplete="email"
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-label={t("Email address")}
                placeholder={t("Email address")}
              />
              {fieldError("email")}
              <Input
                {...validationProps("phone")}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-label={t("Phone number")}
                placeholder={t("Phone number")}
              />
              {fieldError("phone")}
              <Select
                disabled={status === "loading"}
                name="interestedCountry"
                required
                value={form.interestedCountry}
                onValueChange={(value) =>
                  updateField("interestedCountry", value)
                }
              >
                <SelectTrigger {...validationProps("interestedCountry")} aria-label={t("Interested country")}>
                  <SelectValue placeholder={t("Interested country")} />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map(({ name: country }) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("interestedCountry")}
              <Textarea
                {...validationProps("message")}
                name="message"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="min-h-28"
                aria-label={t("Tell us about your goals")}
                placeholder={t("Tell us about your goals")}
              />
              {fieldError("message")}
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Send size={17} />
                )}{" "}
                {status === "loading" ? t("Submitting…") : t("Submit interest")}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
