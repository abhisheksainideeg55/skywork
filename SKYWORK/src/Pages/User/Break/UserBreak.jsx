import React from "react";
import {
  FiCoffee,
  FiClock,
  FiUser,
  FiShield,
  FiInfo,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import { useBreak } from "../../../Context/BreakContext";
import BreakLayoutTabs from "../../../Components/Break/BreakLayoutTabs";
import BreakLiveClockBanner from "../../../Components/Break/BreakLiveClockBanner";
import BreakPolicyCards from "../../../Components/Break/BreakPolicyCards";
import EmployeeBreakActionCard from "../../../Components/Break/EmployeeBreakActionCard";
import BreakLogsTable from "../../../Components/Break/BreakLogsTable";
import BreakToast from "../../../Components/Break/BreakToast";

export default function UserBreak() {
  const { breakPolicies, breakLogs, toast, clearToast } = useBreak();

  const loggedInUser = {
    employeeId: "EMP001",
    name: "Abhishek Sharma",
    department: "Engineering",
    role: "Senior Developer",
    shiftType: "Day Shift",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  // Filter personal break logs for this employee
  const myBreakLogs = breakLogs.filter(
    (l) => l.employeeId === loggedInUser.employeeId
  );

  // Policies relevant to user's shift (Day Shift)
  const myShiftPolicies = breakPolicies.filter(
    (p) =>
      p.shiftType === loggedInUser.shiftType || p.shiftType === "All Shifts"
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      <BreakToast toast={toast} onClose={clearToast} />

      {/* Role Layout Tabs */}
      <BreakLayoutTabs />

      {/* Employee Shift Header Alert */}
      <div className="p-4 rounded-2xl bg-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src={loggedInUser.avatar}
            alt={loggedInUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                My Break Portal • {loggedInUser.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/40 text-[10px] font-bold">
                Employee Self-Service
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              {loggedInUser.department} • {loggedInUser.role} • Assigned to {loggedInUser.shiftType} (09:00 AM – 06:00 PM).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/10 self-start sm:self-auto">
          <FiLock className="w-3.5 h-3.5 text-amber-300" />
          <span>Managed by HR Admin</span>
        </div>
      </div>

      {/* 1. Live Take Break / Resume Work Stopwatch Card */}
      <EmployeeBreakActionCard currentUser={loggedInUser} />

      {/* 2. Live Clock & Alarm Test Banner */}
      <BreakLiveClockBanner userShift={loggedInUser.shiftType} />

      {/* 3. My Scheduled Shift Breaks */}
      <BreakPolicyCards policies={myShiftPolicies} isHR={false} />

      {/* 4. My Recent Break Logs */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-indigo-600" />
              <span>My Today Break History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of your daily meal & refreshment breaks.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {myBreakLogs.length} Records
          </span>
        </div>

        <BreakLogsTable logs={myBreakLogs} />
      </div>

      {/* 5. Company Break Policy Guidelines */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
          <FiInfo className="w-4 h-4 text-indigo-600" />
          <span>Break Policy & Automatic Alarm Guidelines</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: How does the automatic break alarm chime work?
            </strong>
            <p>
              When a scheduled break window begins (such as Lunch Break at 01:00 PM or Tea Break at 04:45 PM), an audible notification chime rings in your browser and an on-screen modal pops up so you never miss designated refreshment hours.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: What should I do before stepping away from my desk?
            </strong>
            <p>
              Please click "Take Break Now" above to initiate your live break timer. When you return, click "Resume Work & Log Break" to maintain accurate productivity records.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: Who configures and updates the break timings?
            </strong>
            <p>
              Break policies and shift meal schedules are managed exclusively by HR Administration. If your team requires an alternate timing, your manager can coordinate with HR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
