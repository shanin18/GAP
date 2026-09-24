"use client";
import { useWebsiteContent } from "@/components/website-content-provider";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { CheckCircle2, Loader2, RefreshCw, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Card, cardVariants } from "./ui/card";

type Option = { id: string | number; name: string; country?: string | number };
const initial = {
  studentName: "",
  email: "",
  phone: "",
  countryId: "",
  universityId: "",
  studyLevel: "",
  intake: "",
  message: "",
};
export function ApplicationForm() {
  const t = useWebsiteContent("application-form");

  const [form, setForm] = useState(initial);
  const [countries, setCountries] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [optionsStatus, setOptionsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setOptionsStatus("loading");
    async function load() {
      try {
        const response = await fetch("/api/application-options", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Options unavailable");
        const data = await response.json();
        if (!Array.isArray(data.countries) || !Array.isArray(data.universities))
          throw new Error("Invalid options");
        setCountries(data.countries);
        setUniversities(data.universities);
        setOptionsStatus("ready");
      } catch {
        if (!controller.signal.aborted) setOptionsStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  const available = useMemo(
    () =>
      universities.filter(
        (u) => !form.countryId || String(u.country) === form.countryId,
      ),
    [universities, form.countryId],
  );
  function update(name: keyof typeof initial, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "countryId" ? { universityId: "" } : {}),
    }));
    setStatus("idle");
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (optionsStatus !== "ready" || !countries.length || status === "loading")
      return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          universityId: form.universityId || null,
          sourcePage: location.pathname,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to submit application.");
      setReference(data.reference);
      setStatus("success");
      setForm(initial);
    } catch (cause) {
      setStatus("error");
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit application.",
      );
    }
  }
  if (status === "success")
    return (
      <Card role="status" className="text-center">
        <CheckCircle2
          aria-hidden="true"
          size={48}
          className="mx-auto text-primary"
        />
        <h2 className="mt-5 font-display text-3xl">
          {t("Application received.")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("Keep this reference for your records.")}
        </p>
        <div className="mt-6 break-all rounded-xl bg-muted p-4 font-mono font-semibold">
          {reference}
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          {t(
            "A GAP adviser will review your profile and contact you about the next steps.",
          )}
        </p>
      </Card>
    );
  return (
    <form
      onSubmit={submit}
      className={cardVariants()}
      aria-busy={status === "loading"}
    >
      <fieldset disabled={status === "loading"} className="grid min-w-0 gap-5">
        <legend className="mb-6 font-display text-2xl">
          {t("Your study plans")}
        </legend>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <label className="grid min-w-0 gap-2 text-sm font-semibold">
            {t("Full name ")}
            <Input
              required
              autoComplete="name"
              value={form.studentName}
              onChange={(e) => update("studentName", e.target.value)}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold">
            {t("Email address ")}
            <Input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold">
            {t("Phone number (optional) ")}
            <Input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
          <div className="grid gap-2">
            <label
              htmlFor="application-level"
              className="text-sm font-semibold"
            >
              {t("Study level")}
            </label>
            <Select
              name="studyLevel"
              required
              value={form.studyLevel}
              onValueChange={(value) => update("studyLevel", value)}
            >
              <SelectTrigger id="application-level">
                <SelectValue placeholder={t("Choose study level")} />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Foundation",
                  "Undergraduate",
                  "Postgraduate",
                  "PhD",
                  "Other",
                ].map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="application-country"
              className="text-sm font-semibold"
            >
              {t("Destination")}
            </label>
            {optionsStatus === "loading" ? (
              <Skeleton className="h-11" />
            ) : (
              <Select
                name="countryId"
                required
                disabled={optionsStatus !== "ready" || !countries.length}
                value={form.countryId}
                onValueChange={(value) => update("countryId", value)}
              >
                <SelectTrigger id="application-country">
                  <SelectValue placeholder={t("Choose destination")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="application-university"
              className="text-sm font-semibold"
            >
              {t("University (optional)")}
            </label>
            {optionsStatus === "loading" ? (
              <Skeleton className="h-11" />
            ) : (
              <Select
                name="universityId"
                disabled={optionsStatus !== "ready"}
                value={form.universityId || "none"}
                onValueChange={(value) =>
                  update("universityId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="application-university">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("Help me choose")}</SelectItem>
                  {available.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            {t("Preferred intake (optional)")}
            <Input
              placeholder={t("e.g. February 2027")}
              value={form.intake}
              onChange={(e) => update("intake", e.target.value)}
            />
          </label>
        </div>
        {optionsStatus === "loading" && (
          <p role="status" className="text-sm text-muted-foreground">
            {t("Loading study destinations…")}
          </p>
        )}
        {optionsStatus === "error" && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 p-4"
          >
            <p className="text-sm">
              {t(
                "We couldn't load the study destinations. Your details are still here.",
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => setRetry((value) => value + 1)}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {t("Try again")}
            </Button>
          </div>
        )}
        {optionsStatus === "ready" && !countries.length && (
          <p
            role="status"
            className="rounded-xl bg-muted p-4 text-sm leading-6"
          >
            {t(
              "Online applications are not available yet. Use Apply Now to speak with an adviser about your destination.",
            )}
          </p>
        )}
        <label className="grid gap-2 text-sm font-semibold">
          {t("Your study goals (optional)")}
          <Textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </label>
        <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
          {t(
            "After submission, an adviser will explain how to provide any required documents securely.",
          )}
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            status === "loading" ||
            optionsStatus !== "ready" ||
            !countries.length
          }
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" size={17} aria-hidden="true" />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
          {status === "loading" ? t("Submitting…") : t("Submit application")}
        </Button>
      </fieldset>
    </form>
  );
}
