"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ConnectionFormState, ConnectionFormValues } from "@/features/connections/form";
import { AUTH_TYPES, HTTP_METHODS, type AuthType } from "@/features/connections/types";

type ConnectionFormProps = {
  action: (
    state: ConnectionFormState,
    formData: FormData,
  ) => Promise<ConnectionFormState>;
  initialValues: ConnectionFormValues;
  secretStored: boolean;
  submitLabel: string;
  pendingLabel: string;
};

const SECTION_CLASSES =
  "flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]";

export function ConnectionForm({
  action,
  initialValues,
  secretStored,
  submitLabel,
  pendingLabel,
}: ConnectionFormProps) {
  const t = useTranslations("connections");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(action, {
    values: initialValues,
    errors: {},
    formError: null,
  });
  const { values, errors } = state;
  const [authType, setAuthType] = useState<AuthType>(values.authType);

  return (
    <form
      action={formAction}
      noValidate
      className="mx-auto flex w-full max-w-[720px] flex-col gap-6"
    >
      <section className={SECTION_CLASSES}>
        <h2 className="text-base font-semibold">{t("form.api")}</h2>

        <FormField
          label={t("form.name")}
          hint={t("form.nameHint")}
          error={errors.name}
        >
          <Input
            name="name"
            defaultValue={values.name}
            maxLength={64}
            placeholder="crm"
            className="font-mono"
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <FormField
          label={t("form.description")}
          hint={t("form.descriptionHint")}
          error={errors.description}
        >
          <Input
            name="description"
            defaultValue={values.description}
            maxLength={500}
            placeholder={t("form.descriptionPlaceholder")}
            aria-invalid={Boolean(errors.description)}
          />
        </FormField>

        <FormField
          label={t("form.baseUrl")}
          hint={t("form.baseUrlHint")}
          error={errors.baseUrl}
        >
          <Input
            name="baseUrl"
            type="url"
            defaultValue={values.baseUrl}
            maxLength={2048}
            placeholder="https://api.example.com/v1"
            className="font-mono"
            aria-invalid={Boolean(errors.baseUrl)}
          />
        </FormField>
      </section>

      <section className={SECTION_CLASSES}>
        <div>
          <h2 className="text-base font-semibold">{t("form.auth")}</h2>
          <p className="text-[13px] text-fg-muted">{t("form.authLead")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("form.type")}>
            <Select
              name="authType"
              value={authType}
              onChange={(event) => setAuthType(event.target.value as AuthType)}
            >
              {AUTH_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`authTypes.${type}`)}
                </option>
              ))}
            </Select>
          </FormField>

          {authType === "header" && (
            <FormField label={t("form.headerName")} error={errors.authHeaderName}>
              <Input
                name="authHeaderName"
                defaultValue={values.authHeaderName}
                maxLength={100}
                className="font-mono"
                aria-invalid={Boolean(errors.authHeaderName)}
              />
            </FormField>
          )}
        </div>

        {authType !== "none" && (
          <FormField
            label={authType === "bearer" ? t("form.token") : t("form.apiKey")}
            hint={secretStored ? t("form.secretStored") : undefined}
            error={errors.secret}
          >
            <Input
              name="secret"
              type="password"
              autoComplete="off"
              maxLength={4096}
              placeholder={secretStored ? "••••••••" : ""}
              className="font-mono"
              aria-invalid={Boolean(errors.secret)}
            />
          </FormField>
        )}
      </section>

      <section className={SECTION_CLASSES}>
        <div>
          <h2 className="text-base font-semibold">{t("form.methods")}</h2>
          <p className="text-[13px] text-fg-muted">{t("form.methodsLead")}</p>
        </div>

        <div
          role="group"
          aria-label={t("form.methods")}
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          {HTTP_METHODS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 font-mono text-[13px]"
            >
              <input
                type="checkbox"
                name="allowedMethods"
                value={method}
                defaultChecked={values.allowedMethods.includes(method)}
                className="size-4 accent-accent"
              />
              {method}
            </label>
          ))}
        </div>
        {errors.allowedMethods && (
          <p className="text-xs text-danger">{errors.allowedMethods}</p>
        )}
      </section>

      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger"
        >
          {state.formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Link href="/connections" className={buttonClasses("secondary")}>
          {tCommon("cancel")}
        </Link>
        <SubmitButton variant="primary" pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
