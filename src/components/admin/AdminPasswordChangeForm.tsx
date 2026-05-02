"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { changePasswordAction } from "@/features/auth/actions";

type FieldErrors = Record<string, string[] | undefined>;

const panelStyle = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  boxShadow: "0 24px 56px rgba(0,0,0,0.34)",
  backdropFilter: "blur(18px)",
};

const inputStyle = {
  background: "rgba(17,17,9,0.92)",
  border: "1px solid rgba(201,168,76,0.16)",
  color: "var(--color-text)",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-300">{message}</p>;
}

export function AdminPasswordChangeForm({
  userEmail,
}: {
  userEmail: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await changePasswordAction(formData);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      form.reset();
      setSuccess("Mot de passe mis a jour. Les autres sessions ont ete revoquees.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em]" style={{ color: "#C9A84C" }}>
            Securite
          </p>
          <h1
            className="mt-2"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "2.4rem",
              lineHeight: 0.98,
              color: "#FFFFFF",
            }}
          >
            Changer le mot de passe
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.56)" }}>
            Compte connecte : {userEmail}
          </p>
        </div>

        <Link href="/admin/settings" className="btn-secondary px-4 py-2.5 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Retour aux parametres
        </Link>
      </div>

      <div
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-apple-xl p-6 md:p-8"
          style={panelStyle}
        >
          <div className="mb-6 flex items-start gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.24)",
                color: "#C9A84C",
              }}
            >
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl" style={{ color: "#FFFFFF" }}>
                Mettre a jour vos identifiants
              </h2>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.56)" }}>
                Saisissez votre mot de passe actuel, puis choisissez un nouveau mot de passe
                plus robuste.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="label">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                disabled={isPending}
                className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
                style={inputStyle}
                placeholder="Entrez votre mot de passe actuel"
              />
              <FieldError message={fieldErrors.currentPassword?.[0]} />
            </div>

            <div>
              <label htmlFor="newPassword" className="label">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
                style={inputStyle}
                placeholder="Au moins 8 caracteres, 1 majuscule et 1 chiffre"
              />
              <FieldError message={fieldErrors.newPassword?.[0]} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
                style={inputStyle}
                placeholder="Retapez le nouveau mot de passe"
              />
              <FieldError message={fieldErrors.confirmPassword?.[0]} />
            </div>
          </div>

          {error ? (
            <div
              className="mt-5 rounded-apple-md px-4 py-3 text-sm text-red-200"
              style={{
                background: "rgba(120,32,32,0.18)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              className="mt-5 flex items-center gap-2 rounded-apple-md px-4 py-3 text-sm"
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.18)",
                color: "#F3E3AF",
              }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={isPending} className="btn-primary px-6 py-3 text-sm">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise a jour...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Mettre a jour le mot de passe
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="rounded-apple-xl p-6" style={panelStyle}>
          <p className="text-[11px] uppercase tracking-[0.34em]" style={{ color: "#C9A84C" }}>
            Bonnes pratiques
          </p>
          <h2 className="mt-3 text-2xl" style={{ color: "#FFFFFF" }}>
            Recommandations
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "rgba(255,255,255,0.62)" }}>
            <li>Utiliser au minimum 12 caracteres si possible.</li>
            <li>Melanger majuscules, chiffres et formulation unique.</li>
            <li>Eviter les mots de passe deja utilises ailleurs.</li>
            <li>Apres changement, les autres sessions actives seront invalidees.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
