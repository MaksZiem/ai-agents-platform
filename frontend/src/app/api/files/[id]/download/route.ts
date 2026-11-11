import { proxyDownload } from "@/lib/proxy-download";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/files/[id]/download">,
) {
  const { id } = await params;
  return proxyDownload(`/files/${encodeURIComponent(id)}/download`);
}
