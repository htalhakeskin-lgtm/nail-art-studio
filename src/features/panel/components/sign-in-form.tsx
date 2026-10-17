"use client";

import { useActionState } from "react";

import { signIn } from "../actions";
import type { SignInState } from "../schemas";

const inputClass =
  "border-input bg-surface mt-2 block min-h-12 w-full rounded-lg border px-3 text-base aria-invalid:border-danger";

export function SignInForm({ returnTo, notice }: { returnTo?: string; notice?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={action} noValidate className="mt-8 space-y-5">
      {(state.message ?? notice) && (
        <p
          role="alert"
          className="rounded-lg bg-danger-muted px-4 py-3 text-sm font-semibold text-danger"
        >
          {state.message ?? notice}
        </p>
      )}
      {returnTo && <input type="hidden" name="donus" value={returnTo} />}

      <div>
        <label htmlFor="email" className="font-semibold">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-hata" : undefined}
          className={inputClass}
        />
        {emailError && (
          <p id="email-hata" className="mt-1 text-sm text-danger">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="font-semibold">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "password-hata" : undefined}
          className={inputClass}
        />
        {passwordError && (
          <p id="password-hata" className="mt-1 text-sm text-danger">
            {passwordError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
