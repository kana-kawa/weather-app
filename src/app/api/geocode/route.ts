import { NextRequest, NextResponse } from "next/server";
import type { GeocodeResult } from "@/lib/types";

const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーにAPIキーが設定されていません。" },
      { status: 500 }
    );
  }

  const city = request.nextUrl.searchParams.get("city")?.trim();
  if (!city) {
    return NextResponse.json(
      { error: "都市名を指定してください。" },
      { status: 400 }
    );
  }

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("q", city);
  url.searchParams.set("limit", "5");
  url.searchParams.set("appid", apiKey);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { error: "地名の検索に失敗しました。" },
      { status: res.status }
    );
  }

  const data = (await res.json()) as Array<{
    name: string;
    local_names?: Record<string, string>;
    lat: number;
    lon: number;
    country: string;
    state?: string;
  }>;

  const results: GeocodeResult[] = data.map((d) => ({
    name: d.name,
    localNames: d.local_names,
    lat: d.lat,
    lon: d.lon,
    country: d.country,
    state: d.state,
  }));

  return NextResponse.json({ results });
}
