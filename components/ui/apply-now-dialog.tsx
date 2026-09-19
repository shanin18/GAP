"use client";

import { type FormEvent, type ReactNode, useRef, useState } from "react";
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
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== "idle") setStatus("idle");
    setError("");
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourcePage: window.location.pathname }),
      });
      const result = await response.json();
      if (!response.ok)
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
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClass}>{triggerContent}</Button>
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
              You’re on your way.
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Thanks for reaching out. Our team will contact you shortly.
            </DialogDescription>
          </div>
        ) : (
          <>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              Apply now
            </p>
            <DialogTitle
              ref={titleRef}
              tabIndex={-1}
              className="font-display text-4xl tracking-tight focus:outline-none"
            >
              Start your journey.
            </DialogTitle>
            <DialogDescription className="mt-3 text-muted-foreground">
              Tell us a little about your study-abroad plans.
            </DialogDescription>
            <form onSubmit={submitLead} className="mt-7 grid gap-4">
              <Input
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-label="Full name"
                placeholder="Full name"
              />
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-label="Email address"
                placeholder="Email address"
              />
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-label="Phone number"
                placeholder="Phone number"
              />
              <Select
                name="interestedCountry"
                required
                value={form.interestedCountry}
                onValueChange={(value) =>
                  updateField("interestedCountry", value)
                }
              >
                <SelectTrigger aria-label="Interested country">
                  <SelectValue placeholder="Interested country" />
                </SelectTrigger>
                <SelectContent>
                  {["Australia", "Canada", "New Zealand"].map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="min-h-28"
                aria-label="Tell us about your goals"
                placeholder="Tell us about your goals"
              />
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
                {status === "loading" ? "Submitting…" : "Submit interest"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
