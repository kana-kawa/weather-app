export type GeocodeResult = {
  name: string;
  localNames?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export type DailyForecast = {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "3時間ごと" summary label
  temp: number; // representative temp (noon-ish) in Celsius
  tempMin: number;
  tempMax: number;
  humidity: number;
  pop: number; // probability of precipitation 0-100
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  entries: ForecastEntry[];
};

export type ForecastEntry = {
  dt: number;
  time: string; // HH:mm
  temp: number;
  humidity: number;
  pop: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
};

export type WeatherResponse = {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pop: number;
    weatherMain: string;
    weatherDescription: string;
    weatherIcon: string;
    dt: number;
  };
  daily: DailyForecast[];
};
