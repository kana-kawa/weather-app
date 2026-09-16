import { NextRequest, NextResponse } from "next/server";
import type { DailyForecast, ForecastEntry, WeatherResponse } from "@/lib/types";

const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

type OWMWeather = {
  main: string;
  description: string;
  icon: string;
};

type OWMForecastItem = {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: OWMWeather[];
  pop: number;
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーにAPIキーが設定されていません。" },
      { status: 500 }
    );
  }

  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const name = request.nextUrl.searchParams.get("name") ?? "";
  const country = request.nextUrl.searchParams.get("country") ?? "";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "緯度・経度を指定してください。" },
      { status: 400 }
    );
  }

  const commonParams = {
    lat,
    lon,
    appid: apiKey,
    units: "metric",
    lang: "ja",
  };

  const currentUrl = new URL(CURRENT_URL);
  const forecastUrl = new URL(FORECAST_URL);
  for (const [key, value] of Object.entries(commonParams)) {
    currentUrl.searchParams.set(key, value);
    forecastUrl.searchParams.set(key, value);
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl, { cache: "no-store" }),
    fetch(forecastUrl, { cache: "no-store" }),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    const failed = !currentRes.ok ? currentRes : forecastRes;
    return NextResponse.json(
      { error: "天気情報の取得に失敗しました。" },
      { status: failed.status }
    );
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const forecastList: OWMForecastItem[] = forecastData.list ?? [];
  const tzOffsetSec: number = forecastData.city?.timezone ?? 0;

  // dt_txt is always UTC; shift by the location's UTC offset to get its local date/time.
  function toLocalDateTime(dtSeconds: number) {
    const local = new Date((dtSeconds + tzOffsetSec) * 1000);
    const y = local.getUTCFullYear();
    const m = String(local.getUTCMonth() + 1).padStart(2, "0");
    const d = String(local.getUTCDate()).padStart(2, "0");
    const hh = String(local.getUTCHours()).padStart(2, "0");
    const mm = String(local.getUTCMinutes()).padStart(2, "0");
    return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
  }

  const byDate = new Map<string, OWMForecastItem[]>();
  for (const item of forecastList) {
    const { date } = toLocalDateTime(item.dt);
    const list = byDate.get(date) ?? [];
    list.push(item);
    byDate.set(date, list);
  }

  const daily: DailyForecast[] = Array.from(byDate.entries()).map(
    ([date, items]) => {
      const entries: ForecastEntry[] = items.map((item) => ({
        dt: item.dt,
        time: toLocalDateTime(item.dt).time,
        temp: Math.round(item.main.temp),
        humidity: item.main.humidity,
        pop: Math.round((item.pop ?? 0) * 100),
        weatherMain: item.weather[0]?.main ?? "",
        weatherDescription: item.weather[0]?.description ?? "",
        weatherIcon: item.weather[0]?.icon ?? "01d",
      }));

      const noonEntry =
        items.find((item) => toLocalDateTime(item.dt).time === "12:00") ??
        items[Math.floor(items.length / 2)];

      const temps = items.map((i) => i.main.temp);
      const humidities = items.map((i) => i.main.humidity);
      const pops = items.map((i) => Math.round((i.pop ?? 0) * 100));

      return {
        date,
        label: date,
        temp: Math.round(noonEntry.main.temp),
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        humidity: Math.round(
          humidities.reduce((a, b) => a + b, 0) / humidities.length
        ),
        pop: Math.max(...pops),
        weatherMain: noonEntry.weather[0]?.main ?? "",
        weatherDescription: noonEntry.weather[0]?.description ?? "",
        weatherIcon: noonEntry.weather[0]?.icon ?? "01d",
        entries,
      };
    }
  );

  const response: WeatherResponse = {
    location: {
      name: name || currentData.name || "",
      country: country || currentData.sys?.country || "",
      lat: Number(lat),
      lon: Number(lon),
    },
    current: {
      temp: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      pop: daily[0]?.pop ?? 0,
      weatherMain: currentData.weather[0]?.main ?? "",
      weatherDescription: currentData.weather[0]?.description ?? "",
      weatherIcon: currentData.weather[0]?.icon ?? "01d",
      dt: currentData.dt,
    },
    daily,
  };

  return NextResponse.json(response);
}
