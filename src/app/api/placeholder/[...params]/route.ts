import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  // Gerar uma imagem placeholder simples
  const resolvedParams = await params;
  const [width = "400", height = "600"] = resolvedParams.params;

  // Retornar uma imagem SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial, sans-serif" font-size="18">
        ${width} × ${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
