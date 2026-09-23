import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiBell,
  FiVolume2,
  FiVolumeX,
  FiActivity,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useBreak } from "../../Context/BreakContext";

export default function BreakLiveClockBanner({ userShift = "Day Shift" }) {
  const {
    breakPolicies,
    triggerTestAlarm,
    isAudioMuted,
    setIsAudioMuted,
    alarmVolume,
    setAlarmVolume,
  } = useBreak();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Find upcoming next break for today
  const currentHHMM = `${String(currentTime.getHours()).padStart(2, "0")}:${String(
    currentTime.getMinutes()
  ).padStart(2, "0")}`;

  const upcomingBreak =
    breakPolicies.find((p) => p.startTime > currentHHMM) ||
    breakPolicies[0] ||
    null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl mb-6 border border-indigo-900/50 relative overflow-hidden">
      {/* Background glowing orb */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-600/20 blur-2xl" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Live Digital Clock */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Real-Time Break Monitor
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              {formattedTime}
            </span>
            <span className="text-xs text-indigo-300 font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/20">
              Shift: {userShift}
            </span>
          </div>

          {upcomingBreak && (
            <p className="text-xs text-slate-300 flex items-center gap-2 pt-1">
              <FiClock className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Next Scheduled Break:{" "}
                <strong className="text-amber-300 font-bold">
                  {upcomingBreak.name}
                </strong>{" "}
                at{" "}
                <span className="font-mono text-white font-semibold">
                  {upcomingBreak.displayTime}
                </span>
              </span>
            </p>
          )}
        </div>

        {/* Alarm Controls & Test Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Audio Volume & Mute control */}
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isAudioMuted ? "Unmute Alarm" : "Mute Alarm"}
            >
              {isAudioMuted ? (
                <FiVolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <FiVolume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isAudioMuted ? 0 : alarmVolume}
              onChange={(e) => {
                setAlarmVolume(Number(e.target.value));
                if (isAudioMuted) setIsAudioMuted(false);
              }}
              className="w-20 accent-indigo-400 h-1 bg-white/20 rounded-lg cursor-pointer"
              title={`Alarm Volume: ${Math.round(alarmVolume * 100)}%`}
            />
          </div>

          {/* Test Break Alarm Button */}
          <button
            type="button"
            onClick={() => triggerTestAlarm()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/30 transition-all hover:scale-102 cursor-pointer"
            title="Simulate live break time alarm with sound and on-screen popup"
          >
            <FiBell className="w-4 h-4 animate-bounce" />
            <span>🔔 Test Break Alarm & Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
