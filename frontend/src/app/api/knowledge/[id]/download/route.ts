import { proxyDownload } from "@/lib/proxy-download";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/knowledge/[id]/download">,
) {
  const { id } = await params;
  return proxyDownload(`/knowledge/${encodeURIComponent(id)}/download`);
}
