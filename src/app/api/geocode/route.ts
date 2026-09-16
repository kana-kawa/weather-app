import { NextRequest, NextResponse } from "next/server";
import type { GeocodeResult } from "@/lib/types";

const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "weather-app-personal-project/1.0";

type NominatimResult = {
  name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    province?: string;
    state?: string;
    country_code?: string;
  };
};

function nominatimToGeocodeResult(r: NominatimResult): GeocodeResult {
  const address = r.address ?? {};
  return {
    name: address.city ?? address.town ?? address.village ?? r.name,
    lat: Number(r.lat),
    lon: Number(r.lon),
    country: (address.country_code ?? "").toUpperCase(),
    state: address.province ?? address.state,
  };
}

async function searchNominatim(
  params: Record<string, string>
): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "ja");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data.map(nominatimToGeocodeResult);
}

// OpenWeatherMap's geocoder only reliably matches Japanese place names when
// they exactly equal an indexed local_names entry (e.g. it misses "札幌"
// because the indexed form is "札幌市"). Fall back to Nominatim, which
// normalizes Japanese administrative names, when OWM finds nothing.
async function searchJapaneseFallback(city: string): Promise<GeocodeResult[]> {
  const jpCity = await searchNominatim({ city, countrycodes: "jp" });
  if (jpCity.length > 0) return jpCity;

  const anyCity = await searchNominatim({ city });
  if (anyCity.length > 0) return anyCity;

  return searchNominatim({ q: city });
}

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

  // OWM's geocoder sometimes matches Japanese-script queries against the
  // wrong (e.g. Chinese) place entirely, not just returning zero results,
  // so for Japanese input try the more reliable Nominatim path first.
  if (/[぀-ヿ一-鿿]/.test(city)) {
    const jaResults = await searchJapaneseFallback(city);
    if (jaResults.length > 0) {
      return NextResponse.json({ results: jaResults });
    }
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

  let results: GeocodeResult[] = data.map((d) => ({
    name: d.name,
    localNames: d.local_names,
    lat: d.lat,
    lon: d.lon,
    country: d.country,
    state: d.state,
  }));

  if (results.length === 0) {
    results = await searchJapaneseFallback(city);
  }

  return NextResponse.json({ results });
}
