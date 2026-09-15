"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/components/weather-calendar.css";

type Props = {
  availableDates: string[]; // YYYY-MM-DD, ascending
  selectedDate: string;
  onSelect: (date: string) => void;
};

function toDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WeatherCalendar({
  availableDates,
  selectedDate,
  onSelect,
}: Props) {
  if (availableDates.length === 0) return null;
  const available = new Set(availableDates);
  const minDate = toDate(availableDates[0]);
  const maxDate = toDate(availableDates[availableDates.length - 1]);

  return (
    <div className="weather-calendar">
      <Calendar
        locale="ja-JP"
        value={toDate(selectedDate)}
        minDate={minDate}
        maxDate={maxDate}
        tileDisabled={({ date }) => !available.has(toDateStr(date))}
        onChange={(value) => {
          if (value instanceof Date) {
            onSelect(toDateStr(value));
          }
        }}
        formatShortWeekday={(_, date) =>
          ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
        }
      />
    </div>
  );
}
