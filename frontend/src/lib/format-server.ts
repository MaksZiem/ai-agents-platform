import { getFormatter, getTranslations } from "next-intl/server";
import { createFormat, type Format } from "@/lib/format";

export async function getFormat(): Promise<Format> {
  return createFormat(await getFormatter(), await getTranslations("format"));
}
