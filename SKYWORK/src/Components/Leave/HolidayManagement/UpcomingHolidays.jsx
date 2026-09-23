import React from "react";
import { FiCalendar, FiClock, FiChevronRight, FiSun } from "react-icons/fi";
import {
  getUpcomingHolidays,
  formatDateDisplay,
  getDaysUntil,
  getHolidayTypeColor,
} from "../../../Utils/holidayUtils";

export default function UpcomingHolidays({
  holidays = [],
  limit = 4,
  onSelectHoliday,
}) {
  const upcomingList = getUpcomingHolidays(holidays, limit);

  if (upcomingList.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Upcoming Holidays</h3>
            <p className="text-xs text-slate-400">
              No upcoming holidays scheduled for the remainder of this cycle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <FiSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Holidays</h3>
            <p className="text-xs text-slate-500 font-medium">
              Next scheduled company off-days
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
          {upcomingList.length} Upcoming
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {upcomingList.map((item) => {
          const daysLeft = getDaysUntil(item.date);
          const typeColor = getHolidayTypeColor(item.type);

          let countdownLabel = `In ${daysLeft} days`;
          if (daysLeft === 0) countdownLabel = "Today 🎉";
          else if (daysLeft === 1) countdownLabel = "Tomorrow ✨";

          return (
            <div
              key={item.id}
              onClick={() => onSelectHoliday && onSelectHoliday(item)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                  >
                    {item.type}
                  </span>

                  <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {countdownLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.name}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {item.description || "Company off-day"}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="font-mono font-semibold text-slate-800">
                  {formatDateDisplay(item.date, true)}
                </span>
                <span className="text-slate-400 font-normal">
                  {item.day || "Holiday"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
