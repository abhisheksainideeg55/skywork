import React, { useState, useMemo } from "react";
import {
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiClock,
  FiCoffee,
  FiShield,
  FiTruck,
  FiCalendar,
  FiUser,
  FiLock,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";
import { useShift } from "../../../Context/ShiftContext";
import { useAuth } from "../../../Context/AuthContext";
import ShiftLayoutTabs from "../../../Components/Shift/ShiftLayoutTabs";
import ShiftTypeCards from "../../../Components/Shift/ShiftTypeCards";
import ShiftDetailsModal from "../../../Components/Shift/ShiftDetailsModal";
import ShiftToast from "../../../Components/Shift/ShiftToast";
import { getShiftDefinition, formatDateDisplay } from "../../../Utils/shiftUtils";

export default function UserShift() {
  const { currentUser } = useAuth();
  const { shiftAllocations, toast, clearToast, getUserShift } = useShift();

  // Logged-in employee from Auth Context
  const loggedInUser = useMemo(() => {
    if (currentUser) {
      return {
        employeeId: currentUser.id || currentUser.employeeId || "EMP001",
        name: currentUser.name || currentUser.employeeName || "Employee",
        department: currentUser.department || "Engineering",
        role: currentUser.designation || currentUser.role || "Staff Employee",
        email: currentUser.email || "employee@skywork.io",
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };
    }
    return {
      employeeId: "EMP001",
      name: "Abhishek Sharma",
      department: "Engineering",
      role: "Senior Developer",
      email: "abhishek@skywork.io",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
  }, [currentUser]);

  const myShift = getUserShift(loggedInUser.employeeId);
  const shiftDef = getShiftDefinition(myShift.shiftType);

  const [selectedShiftForModal, setSelectedShiftForModal] = useState(null);

  // Peers working on the same shift
  const peersOnSameShift = useMemo(() => {
    return (shiftAllocations || []).filter(
      (item) =>
        item.shiftType === myShift.shiftType &&
        item.employeeId !== loggedInUser.employeeId
    );
  }, [shiftAllocations, myShift.shiftType, loggedInUser.employeeId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <ShiftToast toast={toast} onClose={clearToast} />

      {/* Role Layout Tabs */}
      <ShiftLayoutTabs />

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
                My Shift Portal • {loggedInUser.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/40 text-[10px] font-bold">
                Employee Self-Service
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              {loggedInUser.department} • {loggedInUser.role} • Shift allocations are managed by HR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/10 self-start sm:self-auto">
          <FiLock className="w-3.5 h-3.5 text-amber-300" />
          <span>Managed by HR Admin</span>
        </div>
      </div>

      {/* Hero: Active Shift Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${shiftDef.color.gradient}`}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Assigned Schedule
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Shift
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{myShift.shiftType}</span>
              <span className="text-sm sm:text-base font-mono font-medium px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                {shiftDef.code}
              </span>
            </h2>

            <div className="flex items-center gap-3 flex-wrap text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                <FiClock className="w-4 h-4 text-indigo-600" />
                {myShift.timings}
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <FiCoffee className="w-4 h-4 text-amber-500" />
                Break: {shiftDef.lunchBreak}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {shiftDef.description}
            </p>
          </div>

          {/* Quick Metrics Badge Panel */}
          <div className="w-full lg:w-auto bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Effective Period:</span>
              <strong className="text-slate-800 font-semibold">
                {formatDateDisplay(myShift.effectiveFrom, true)} →{" "}
                {formatDateDisplay(myShift.effectiveTo, true)}
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
              <span className="text-slate-500 font-medium">Rotation Cycle:</span>
              <span className="text-slate-700 font-bold">
                {myShift.rotationCycle || "Fixed Schedule"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
              <span className="text-slate-500 font-medium">Allocated By:</span>
              <span className="text-slate-700 font-medium">
                {myShift.allocatedBy || "HR Admin"}
              </span>
            </div>

            <button
              onClick={() => setSelectedShiftForModal(myShift)}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs text-center block"
            >
              View Full Shift Guidelines →
            </button>
          </div>
        </div>

        {/* Benefits & Transport row */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <FiShield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Allowance & Compensation
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                {shiftDef.allowance}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
            <FiTruck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-950">
                Transport & Safety Support
              </p>
              <p className="text-xs text-blue-800 mt-0.5">
                {shiftDef.transportSupport}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. All 3 Company Shift Types Overview */}
      <ShiftTypeCards allocations={shiftAllocations} />

      {/* 3. Colleagues on Same Shift */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-indigo-600" />
              <span>Colleagues on {myShift.shiftType}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Team members sharing your active shift hours and break schedules.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {peersOnSameShift.length} Peers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {peersOnSameShift.map((peer) => (
            <div
              key={peer.id}
              onClick={() => setSelectedShiftForModal(peer)}
              className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-200 transition-all cursor-pointer flex items-center gap-3"
            >
              <img
                src={peer.avatar}
                alt={peer.employeeName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {peer.employeeName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {peer.department}
                </p>
                <p className="text-[10px] text-indigo-600 font-medium truncate">
                  {peer.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Shift Policy & Guidelines FAQ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
          <FiInfo className="w-4 h-4 text-indigo-600" />
          <span>Shift Policy & Change Request Guidelines</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: Who can modify or swap my allocated shift?
            </strong>
            <p>
              In accordance with company policy, shift assignments and rotations are managed exclusively by HR Administration. If you need a temporary swap or adjustment, please raise a request with HR Operations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: How does the Rotational Shift cycle operate?
            </strong>
            <p>
              Rotational shifts alternate bi-weekly between morning and afternoon/evening windows to ensure 24/7 client coverage and fair workload distribution. You will receive an automated notification 3 days before rotation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="text-slate-800 block mb-1">
              Q: Are cab facilities provided for Night Shift staff?
            </strong>
            <p>
              Yes, all employees scheduled on Night Shift (09:00 PM – 06:00 AM) and evening rotational shifts concluding post 10:00 PM are provided with complimentary GPS-tracked door-to-door cab services.
            </p>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <ShiftDetailsModal
        isOpen={Boolean(selectedShiftForModal)}
        onClose={() => setSelectedShiftForModal(null)}
        shiftRecord={selectedShiftForModal}
      />
    </div>
  );
}
