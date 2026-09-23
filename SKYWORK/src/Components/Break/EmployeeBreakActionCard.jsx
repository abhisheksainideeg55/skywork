import React, { useState, useEffect } from "react";
import {
  FiCoffee,
  FiPlay,
  FiSquare,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { useBreak } from "../../Context/BreakContext";
import { formatTimerSeconds } from "../../Utils/breakUtils";

export default function EmployeeBreakActionCard({
  currentUser = {
    employeeId: "EMP001",
    name: "Abhishek Sharma",
    department: "Engineering",
    role: "Senior Developer",
  },
}) {
  const { activeBreak, startBreak, endBreak, breakPolicies } = useBreak();
  const [selectedBreakType, setSelectedBreakType] = useState("Lunch Break");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer tick when activeBreak is present
  useEffect(() => {
    if (!activeBreak) {
      setElapsedSeconds(0);
      return;
    }

    const startTs = activeBreak.startTimestamp || Date.now();
    const update = () => {
      const diffSecs = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeBreak]);

  const allowedSeconds = (activeBreak?.allowedMinutes || 60) * 60;
  const isOverstay = elapsedSeconds > allowedSeconds;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-6 relative overflow-hidden">
      {activeBreak ? (
        /* State 1: Currently ON BREAK */
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
              <FiCoffee className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-ping">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Break in Progress
                </span>
                <span className="text-xs text-slate-500">
                  Started at {activeBreak.startTime}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeBreak.breakType}
              </h3>
              <p className="text-xs text-slate-500">
                Allowed Time:{" "}
                <strong className="text-slate-800">
                  {activeBreak.allowedMinutes} Mins
                </strong>
              </p>
            </div>
          </div>

          {/* Live Timer & Stop Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div
              className={`px-6 py-3 rounded-2xl border text-center ${
                isOverstay
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isOverstay ? "⚠️ Overstay Time" : "Elapsed Break Time"}
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-tight">
                {formatTimerSeconds(elapsedSeconds)}
              </span>
            </div>

            <button
              type="button"
              onClick={endBreak}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
            >
              <FiSquare className="w-4 h-4 fill-white" />
              <span>Resume Work & Log Break</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 2: At Desk / READY TO TAKE BREAK */
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <FiCoffee className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Take a Quick Break
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Ready at Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your break type to start live tracking and avoid break overstay alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <select
              value={selectedBreakType}
              onChange={(e) => setSelectedBreakType(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Lunch Break">🍽️ Lunch Break (60 Mins)</option>
              <option value="Morning Tea Break">☕ Morning Tea Break (15 Mins)</option>
              <option value="Evening Tea Break">🍵 Evening Tea Break (15 Mins)</option>
              <option value="Dinner Break">🌙 Dinner Break (60 Mins)</option>
              <option value="Midnight Refreshment">🥪 Midnight Refreshment (15 Mins)</option>
              <option value="Short Bio Break">⚡ Short / Bio Break (10 Mins)</option>
            </select>

            <button
              type="button"
              onClick={() => startBreak(currentUser, selectedBreakType)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs shadow-indigo-200 transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <FiPlay className="w-4 h-4 fill-white" />
              <span>Take Break Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
