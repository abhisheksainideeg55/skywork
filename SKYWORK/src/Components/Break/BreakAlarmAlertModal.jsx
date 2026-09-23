import React, { useEffect, useState } from "react";
import {
  FiBell,
  FiClock,
  FiCoffee,
  FiShield,
  FiX,
  FiPlay,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { useBreak } from "../../Context/BreakContext";
import { breakAlarmAudio } from "../../Utils/breakAlarmAudio";

export default function BreakAlarmAlertModal() {
  const {
    activeAlarmAlert,
    dismissAlert,
    snoozeAlert,
    startBreak,
    isAudioMuted,
    setIsAudioMuted,
  } = useBreak();

  const [countdown, setCountdown] = useState(60);

  // Countdown timer for automatic close or visual urgency
  useEffect(() => {
    if (!activeAlarmAlert) return;
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAlarmAlert]);

  if (!activeAlarmAlert) return null;

  const handleStartBreak = () => {
    startBreak(
      {
        employeeId: "EMP001",
        name: "Abhishek Sharma",
        department: "Engineering",
        role: "Senior Developer",
      },
      activeAlarmAlert.type
    );
  };

  const handleReplayAlarm = () => {
    breakAlarmAudio.playSound(activeAlarmAlert.alarmSound || "chime");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg border-2 border-indigo-400 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up ring-4 ring-indigo-500/20">
        {/* Animated Alarm Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Subtle pulsating background effect */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-xl animate-pulse" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300 shadow-md animate-bounce">
              <FiBell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase animate-pulse">
                  {activeAlarmAlert.isTest ? "Test Alarm Trigger" : "Scheduled Alarm"}
                </span>
                <span className="text-xs text-indigo-100 font-mono">
                  {activeAlarmAlert.triggeredAt}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
                🔔 BREAK TIME ALERT!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isAudioMuted ? "Unmute Alarm" : "Mute Alarm"}
            >
              {isAudioMuted ? (
                <FiVolumeX className="w-4 h-4 text-rose-300" />
              ) : (
                <FiVolume2 className="w-4 h-4 text-emerald-300" />
              )}
            </button>

            <button
              type="button"
              onClick={dismissAlert}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Alert"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-700 overflow-y-auto flex-1">
          {/* Main Break Information Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-lg font-extrabold text-indigo-950">
                {activeAlarmAlert.name}
              </h4>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs self-center sm:self-auto">
                {activeAlarmAlert.durationMinutes} Minutes
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeAlarmAlert.description}
            </p>
          </div>

          {/* Timings & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-1">
                <FiClock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scheduled Window</span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {activeAlarmAlert.displayTime}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target: {activeAlarmAlert.shiftType}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-1">
                <FiCoffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Cafeteria / Pantry</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {activeAlarmAlert.location || "Office Dining Hall"}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {activeAlarmAlert.allowance || "Complimentary Refreshments"}
              </p>
            </div>
          </div>

          {/* Sound Replay Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">
              Alarm Sound:{" "}
              <strong className="text-slate-900 capitalize">
                {activeAlarmAlert.alarmSound || "Chime"}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleReplayAlarm}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[11px]"
            >
              <FiPlay className="w-3 h-3 text-indigo-600" />
              <span>Replay Sound</span>
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => snoozeAlert(5)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer text-center"
          >
            ⏰ Snooze (5 Mins)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={dismissAlert}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center"
            >
              Dismiss
            </button>

            <button
              type="button"
              onClick={handleStartBreak}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-200 transition-all hover:scale-102 cursor-pointer text-center"
            >
              ☕ Start Break Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
