import { getAccessToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/files/[id]/download">,
) {
  const { id } = await params;
  const token = await getAccessToken();

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const response = await fetch(
    `${API_URL}/files/${encodeURIComponent(id)}/download`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return new Response(response.statusText || "Download failed", {
      status: response.status,
    });
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(response.body, { headers });
}
