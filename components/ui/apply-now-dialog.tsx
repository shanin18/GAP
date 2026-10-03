"use client";
import { useDestinations } from "../destinations-provider";
import { useWebsiteContent } from "@/components/website-content-provider";

import { type FormEvent, useId, useRef, useState } from "react";
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
import { Turnstile, turnstileEnabled } from './turnstile';
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
  inline = false,
  initialCountry = "",
}: {
  triggerClass?: string;
  inline?: boolean;
  initialCountry?: string;
}) {
  const t = useWebsiteContent("enquiry-form");
  const [turnstileToken, setTurnstileToken] = useState('');
  const [verificationReset, setVerificationReset] = useState(0);
  const destinations = useDestinations();

  const [form, setForm] = useState({ ...initialForm, interestedCountry: initialCountry });
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
    if (turnstileEnabled && !turnstileToken) { setError('Please complete the security verification.'); return; }
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
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
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
      setTurnstileToken('');
      setVerificationReset(value => value + 1);
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

  const Heading = inline ? "h3" : DialogTitle;
  const Description = inline ? "p" : DialogDescription;
  const content = (status === "success" ? (
          <div className="grid gap-4 py-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <Heading
              ref={titleRef}
              tabIndex={-1}
              className={`font-display tracking-tight focus:outline-none ${inline ? "text-2xl" : "text-4xl"}`}
            >
              {t("You’re on your way.")}
            </Heading>
            <Description className="text-muted-foreground">
              {t("Thanks for reaching out. Our team will contact you shortly.")}
            </Description>
          </div>
        ) : (
          <>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Book an appointment")}
            </p>
            <Heading
              ref={titleRef}
              tabIndex={-1}
              className={`font-display tracking-tight focus:outline-none ${inline ? "text-2xl" : "text-4xl"}`}
            >
              {t("Start your journey.")}
            </Heading>
            <Description className="mt-3 text-muted-foreground">
              {t("Tell us a little about your study-abroad plans.")}
            </Description>
            <form noValidate onSubmit={submitLead} className="mt-5 grid gap-3">
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
              <Turnstile action="lead" onToken={setTurnstileToken} resetKey={verificationReset} />
              <Button type="submit" disabled={status === "loading" || (turnstileEnabled && !turnstileToken)}>
                {status === "loading" ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Send size={17} />
                )}{" "}
                {status === "loading" ? t("Submitting…") : t("Submit interest")}
              </Button>
            </form>
          </>
        ));
  if (inline) return <div>{content}</div>;

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
          {t("Book an appointment")}
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          // Announce the dialog before entering the form, without opening the mobile keyboard.
          event.preventDefault();
          titleRef.current?.focus({ preventScroll: true });
        }}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
