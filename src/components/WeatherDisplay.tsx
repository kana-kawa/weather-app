import type { WeatherResponse } from "@/lib/types";

type Props = {
  weather: WeatherResponse;
  selectedDate: string;
};

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  return `${m}月${d}日（${weekday}）`;
}

export default function WeatherDisplay({ weather, selectedDate }: Props) {
  const day = weather.daily.find((d) => d.date === selectedDate);
  const isToday = selectedDate === weather.daily[0]?.date;

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {weather.location.name}
          {weather.location.country ? `, ${weather.location.country}` : ""}
        </h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          {formatDateLabel(selectedDate)}
          {isToday && (
            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 dark:bg-sky-900 dark:text-sky-300">
              今日
            </span>
          )}
        </p>
      </div>

      {isToday && (
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-sky-50 p-3 dark:bg-sky-950/40">
          <img
            src={iconUrl(weather.current.weatherIcon)}
            alt={weather.current.weatherDescription}
            width={56}
            height={56}
          />
          <div>
            <p className="text-3xl font-bold">{weather.current.temp}°C</p>
            <p className="text-sm text-black/60 dark:text-white/60">
              現在 · {weather.current.weatherDescription} · 体感{" "}
              {weather.current.feelsLike}°C
            </p>
          </div>
        </div>
      )}

      {day ? (
        <>
          <div className="flex items-center gap-4">
            <img
              src={iconUrl(day.weatherIcon)}
              alt={day.weatherDescription}
              width={64}
              height={64}
            />
            <div>
              <p className="text-2xl font-bold capitalize">
                {day.weatherDescription}
              </p>
              <p className="text-sm text-black/60 dark:text-white/60">
                最高 {day.tempMax}°C / 最低 {day.tempMin}°C
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs text-black/50 dark:text-white/50">気温</p>
              <p className="text-lg font-semibold">{day.temp}°C</p>
            </div>
            <div className="rounded-lg bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs text-black/50 dark:text-white/50">湿度</p>
              <p className="text-lg font-semibold">{day.humidity}%</p>
            </div>
            <div className="rounded-lg bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs text-black/50 dark:text-white/50">
                降水確率
              </p>
              <p className="text-lg font-semibold">{day.pop}%</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-black/50 dark:text-white/50">
              3時間ごとの予報
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {day.entries.map((entry) => (
                <div
                  key={entry.dt}
                  className="flex min-w-[64px] flex-col items-center rounded-lg bg-black/5 p-2 text-center dark:bg-white/10"
                >
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {entry.time}
                  </span>
                  <img
                    src={iconUrl(entry.weatherIcon)}
                    alt={entry.weatherDescription}
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-semibold">{entry.temp}°C</span>
                  <span className="text-xs text-sky-600 dark:text-sky-400">
                    💧{entry.pop}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-black/60 dark:text-white/60">
          この日の予報データはありません。
        </p>
      )}
    </div>
  );
}
