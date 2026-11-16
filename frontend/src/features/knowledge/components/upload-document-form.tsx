"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { uploadDocument, type UploadState } from "@/features/knowledge/actions";

const ACCEPTED_EXTENSIONS = ".pdf,.txt,.md,.markdown,.csv,.json";
const INITIAL_STATE: UploadState = { error: null, uploadedName: null };

export function UploadDocumentForm() {
  const t = useTranslations("knowledge.upload");
  const [state, formAction] = useActionState(uploadDocument, INITIAL_STATE);

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]"
    >
      <div>
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-[13px] text-fg-muted">{t("lead")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept={ACCEPTED_EXTENSIONS}
          aria-label={t("field")}
          className="min-w-0 flex-1 text-[13px] text-fg-muted file:mr-3 file:h-[34px] file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface-2 file:px-3.5 file:text-sm file:font-medium file:text-fg hover:file:bg-surface-hover"
        />
        <SubmitButton variant="primary" pendingLabel={t("pending")}>
          {t("submit")}
        </SubmitButton>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {!state.error && state.uploadedName && (
        <p role="status" className="text-xs text-success">
          {t("done", { name: state.uploadedName })}
        </p>
      )}
    </form>
  );
}
