"use client";

import { useCallback, useState } from "react";
import CitySearch from "@/components/CitySearch";
import WeatherCalendar from "@/components/WeatherCalendar";
import WeatherDisplay from "@/components/WeatherDisplay";
import type { GeocodeResult, WeatherResponse } from "@/lib/types";

type Location = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (loc: Location) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(loc.lat),
        lon: String(loc.lon),
        name: loc.name,
        country: loc.country,
      });
      const res = await fetch(`/api/weather?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "天気情報の取得に失敗しました。");
      }
      setWeather(data as WeatherResponse);
      setSelectedDate((data as WeatherResponse).daily[0]?.date ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "天気情報の取得に失敗しました。");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCitySelect = useCallback(
    (result: GeocodeResult) => {
      const loc: Location = {
        name: result.name,
        country: result.country,
        lat: result.lat,
        lon: result.lon,
      };
      setLocation(loc);
      fetchWeather(loc);
    },
    [fetchWeather]
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("このブラウザは位置情報の取得に対応していません。");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const loc: Location = {
          name: "現在地",
          country: "",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLocation(loc);
        fetchWeather(loc);
      },
      () => {
        setLocating(false);
        setError(
          "位置情報を取得できませんでした。ブラウザの位置情報許可を確認してください。"
        );
      }
    );
  }, [fetchWeather]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-b from-sky-50 to-white px-4 py-10 dark:from-slate-950 dark:to-black sm:px-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-sky-900 dark:text-sky-100">
          ☀️ 天気予報
        </h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          都市を検索するか現在地から天気を確認できます
        </p>
      </header>

      <CitySearch
        onSelect={handleCitySelect}
        onUseCurrentLocation={handleUseCurrentLocation}
        locating={locating}
      />

      {loading && (
        <p className="text-sm text-black/60 dark:text-white/60">
          読み込み中…
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {weather && !loading && (
        <>
          <WeatherCalendar
            availableDates={weather.daily.map((d) => d.date)}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          <WeatherDisplay weather={weather} selectedDate={selectedDate} />
        </>
      )}

      {!location && !loading && (
        <p className="mt-8 max-w-md text-center text-sm text-black/50 dark:text-white/50">
          上の検索欄から都市名を入力するか、「現在地の天気を見る」を押してください。
        </p>
      )}
    </div>
  );
}
