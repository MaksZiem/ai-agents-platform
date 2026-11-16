import Link from "next/link";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ItemPicker } from "@/components/ui/item-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import { uploadedFileHref } from "@/features/files/entries";
import { useFormat } from "@/lib/format";
import { attachDocuments, detachDocument } from "@/features/knowledge/actions";
import type { AgentDocument, KnowledgeDocument } from "@/features/knowledge/types";

type AgentKnowledgeProps = {
  agentId: string;
  attached: AgentDocument[];
  library: KnowledgeDocument[];
};

export function AgentKnowledge({
  agentId,
  attached,
  library,
}: AgentKnowledgeProps) {
  const t = useTranslations("agentKnowledge");
  const format = useFormat();
  const attachedIds = new Set(attached.map((document) => document.id));
  const available = library.filter((document) => !attachedIds.has(document.id));

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-[13px] text-fg-muted">{t("lead")}</p>
      </div>

      {attached.length === 0 ? (
        <p className="px-[18px] py-4 text-[13px] text-fg-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
          {attached.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 px-[18px] py-2"
            >
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <Link
                href={uploadedFileHref(document.id)}
                className="min-w-0 flex-1 truncate text-[13px] hover:underline"
              >
                {document.name}
              </Link>
              <span className="font-mono text-xs text-fg-muted">
                {t("chunks", { count: document.chunkCount })}
              </span>
              <form action={detachDocument.bind(null, agentId, document.id)}>
                <SubmitButton
                  variant="ghost"
                  pendingLabel={t("removing")}
                  title={t("removeHint")}
                >
                  {t("remove")}
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-[18px] py-3">
        {available.length > 0 ? (
          <ItemPicker
            items={available.map((document) => ({
              id: document.id,
              label: document.name,
              meta: `${format.bytes(document.sizeBytes)} · ${t("chunks", { count: document.chunkCount })}`,
            }))}
            action={attachDocuments.bind(null, agentId)}
            icon={
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            kind="documents"
          />
        ) : (
          <p className="text-[13px] text-fg-muted">
            {library.length === 0 ? (
              <>
                {t("libraryEmpty")}{" "}
                <Link href="/knowledge" className="text-accent hover:underline">
                  {t("upload")}
                </Link>
              </>
            ) : (
              t("allAttached")
            )}
          </p>
        )}
      </div>
    </section>
  );
}
