import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { getHolidayTypeColor } from "../../../Utils/holidayUtils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HolidayCalendarView({
  holidays = [],
  onSelectHoliday,
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    // If there's an active holiday this year/month, start with it, else today
    return new Date();
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compute days for the month grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create calendar grid items
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: "",
      holidays: [],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${currentYear}-${mm}-${dd}`;

    const matchingHolidays = holidays.filter((h) => h.date === dateStr);

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
      holidays: matchingHolidays,
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: "",
      holidays: [],
    });
  }

  // Holidays this month count
  const thisMonthHolidays = holidays.filter((h) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    return h.date && h.date.startsWith(`${currentYear}-${mm}`);
  });

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Calendar Header / Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {thisMonthHolidays.length}{" "}
              {thisMonthHolidays.length === 1 ? "holiday" : "holidays"} scheduled in{" "}
              {MONTH_NAMES[currentMonth]}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-100/60 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 py-2.5">
        {WEEKDAY_HEADERS.map((w, idx) => (
          <div
            key={w}
            className={idx === 0 || idx === 6 ? "text-rose-500" : "text-slate-600"}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-w-[700px] overflow-x-auto">
        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateStr === todayISO;
          const hasHolidays = cell.holidays.length > 0;

          return (
            <div
              key={idx}
              className={`min-h-[100px] sm:min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                !cell.isCurrentMonth
                  ? "bg-slate-50/40 text-slate-300"
                  : hasHolidays
                  ? "bg-indigo-50/20 hover:bg-indigo-50/40"
                  : "bg-white hover:bg-slate-50/60"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-indigo-600 text-white shadow-xs"
                      : cell.isCurrentMonth
                      ? hasHolidays
                        ? "text-indigo-600 font-extrabold"
                        : "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {cell.day}
                </span>

                {hasHolidays && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-100 animate-pulse" />
                )}
              </div>

              {/* Holiday Pills */}
              <div className="space-y-1 mt-1 flex-1">
                {cell.holidays.map((h) => {
                  const typeColor = getHolidayTypeColor(h.type);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onSelectHoliday && onSelectHoliday(h)}
                      className={`w-full text-left p-1 rounded-md text-[11px] font-semibold truncate border transition-all cursor-pointer block ${typeColor.bg} ${typeColor.text} ${typeColor.border} hover:shadow-xs`}
                      title={`${h.name} (${h.type}) - Click to view`}
                    >
                      <span className="truncate block">🎉 {h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <FiInfo className="w-4 h-4 text-indigo-500" />
          <span>Click on any holiday card in the calendar to view its full details.</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>National</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Festival</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Company</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Optional</span>
          </span>
        </div>
      </div>
    </div>
  );
}
