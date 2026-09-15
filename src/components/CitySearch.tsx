"use client";

import { useState } from "react";
import type { GeocodeResult } from "@/lib/types";

type Props = {
  onSelect: (result: GeocodeResult) => void;
  onUseCurrentLocation: () => void;
  locating: boolean;
};

export default function CitySearch({
  onSelect,
  onUseCurrentLocation,
  locating,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch(
        `/api/geocode?city=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "検索に失敗しました。");
      }
      if (data.results.length === 0) {
        setError("該当する都市が見つかりませんでした。");
      }
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました。");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="都市名を入力（例: Tokyo, Osaka）"
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-400 dark:border-white/15 dark:bg-white/5"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-50"
        >
          {searching ? "検索中…" : "検索"}
        </button>
      </form>

      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={locating}
        className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-white disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-sky-300"
      >
        {locating ? "現在地を取得中…" : "📍 現在地の天気を見る"}
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-black/5 overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:divide-white/10 dark:border-white/15 dark:bg-white/5">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lon}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setResults([]);
                  setQuery(`${r.name}`);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-sky-50 dark:hover:bg-white/10"
              >
                {r.name}
                {r.state ? `, ${r.state}` : ""}, {r.country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
