"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  createSupabaseAuthClient,
  type AdvisorApplicationInput
} from "@/lib/supabase/client";

const initialForm: AdvisorApplicationInput = {
  full_name: "",
  email: "",
  phone: "",
  city: "İstanbul",
  district: "",
  experience_level: "",
  current_company: "",
  preferred_model: "ocean_elite",
  motivation: "",
  contract_accepted: false,
  red_lines_accepted: false,
  commission_model_accepted: false,
  kvkk_accepted: false
};

const modelLabels = {
  ocean_elite: "Ocean Elite",
  ocean_core: "Ocean Core"
} as const;

const modelDescriptions = {
  ocean_elite: "%80 danışman / %20 ofis",
  ocean_core: "%50 danışman / %50 ofis"
} as const;

export default function AdvisorApplicationPage() {
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [form, setForm] = useState<AdvisorApplicationInput>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedModel = form.preferred_model === "ocean_core" ? "ocean_core" : "ocean_elite";

  function updateField<K extends keyof AdvisorApplicationInput>(field: K, value: AdvisorApplicationInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const missingRequired = !form.full_name.trim() || !form.email.trim() || !form.preferred_model;
    const missingConsent = !form.contract_accepted || !form.red_lines_accepted || !form.commission_model_accepted || !form.kvkk_accepted;
    if (missingRequired || missingConsent) {
      setError("Başvuruyu göndermek için zorunlu alanları ve kabul kutularını tamamlayın.");
      return;
    }

    setSubmitting(true);
    try {
      await supabase.submitAdvisorApplication({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLocaleLowerCase("tr-TR"),
        phone: form.phone?.trim() || null,
        city: form.city?.trim() || null,
        district: form.district?.trim() || null,
        experience_level: form.experience_level?.trim() || null,
        current_company: form.current_company?.trim() || null,
        motivation: form.motivation?.trim() || null
      });
      setForm(initialForm);
      setMessage("Başvurunuz alındı. Ocean ekibi değerlendirme sonrası sizinle iletişime geçecek.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Başvuru gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/careers" className="mini-action">Kariyere Dön</Link>

        <header className="mt-10 border-b border-slate-200 pb-8 dark:border-white/10">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Danışman Başvurusu</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">OceanOS Advisor Application</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Ocean Real Estate danışman ağına katılmak için bilgilerinizi ve çalışma prensipleri kabulünüzü iletin.
          </p>
        </header>

        <form onSubmit={submitApplication} className="mt-8 space-y-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <TextField label="Ad Soyad" value={form.full_name} onChange={(value) => updateField("full_name", value)} required />
            <TextField label="E-posta" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
            <TextField label="Telefon" value={form.phone || ""} onChange={(value) => updateField("phone", value)} />
            <TextField label="Şehir" value={form.city || ""} onChange={(value) => updateField("city", value)} />
            <TextField label="İlçe" value={form.district || ""} onChange={(value) => updateField("district", value)} />
            <TextField label="Deneyim seviyesi" value={form.experience_level || ""} onChange={(value) => updateField("experience_level", value)} placeholder="Örn. 3 yıl lüks konut" />
            <TextField label="Mevcut ofis / şirket" value={form.current_company || ""} onChange={(value) => updateField("current_company", value)} />
          </section>

          <section className="border-y border-slate-200 py-6 dark:border-white/10">
            <h2 className="text-lg font-semibold">Komisyon modeli</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["ocean_elite", "ocean_core"] as const).map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => updateField("preferred_model", model)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedModel === model
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-[#080808] dark:text-neutral-200 dark:hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm font-semibold">{modelLabels[model]}</span>
                  <span className="mt-2 block text-xs opacity-75">{modelDescriptions[model]}</span>
                </button>
              ))}
            </div>
          </section>

          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Kısa motivasyon / not
            <textarea
              className="input mt-2 min-h-28 resize-y"
              value={form.motivation || ""}
              onChange={(event) => updateField("motivation", event.target.value)}
              placeholder="Ocean ekibine katılma motivasyonunuzu kısaca yazın."
            />
          </label>

          <section className="space-y-3">
            <Consent
              checked={form.kvkk_accepted}
              onChange={(value) => updateField("kvkk_accepted", value)}
              label="KVKK ve kişisel veri işleme bilgilendirmesini okudum ve kabul ediyorum."
            />
            <Consent
              checked={form.contract_accepted}
              onChange={(value) => updateField("contract_accepted", value)}
              label="Bağımsız Gayrimenkul Danışmanlığı ve Komisyon Paylaşım esaslarını kabul ediyorum."
            />
            <Consent
              checked={form.red_lines_accepted}
              onChange={(value) => updateField("red_lines_accepted", value)}
              label="OCEAN REAL ESTATE çalışma prensiplerini, kırmızı çizgileri ve etik temsil kurallarını okudum ve kabul ediyorum."
            />
            <Consent
              checked={form.commission_model_accepted}
              onChange={(value) => updateField("commission_model_accepted", value)}
              label={`${modelLabels[selectedModel]} komisyon modelini (${modelDescriptions[selectedModel]}) kabul ediyorum.`}
            />
          </section>

          {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
          {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{message}</p> : null}

          <button type="submit" className="button-primary w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
      {label}
      <input
        className="input mt-2"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function Consent({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-[#080808] dark:text-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
      />
      <span>{label}</span>
    </label>
  );
}
