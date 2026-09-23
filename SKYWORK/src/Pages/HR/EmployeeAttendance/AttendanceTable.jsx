import React from "react";
import { FiEye, FiAlertCircle } from "react-icons/fi";

export default function AttendanceTable({
  records = [],
  startIndex = 0,
  onViewRecord,
}) {
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Present
          </span>
        );
      case "Absent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Absent
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Late
          </span>
        );
      case "Half Day":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Half Day
          </span>
        );
      case "Leave":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Leave
          </span>
        );
      case "Holiday":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Holiday
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 text-center w-12">#</th>
              <th className="py-3.5 px-4 min-w-[190px]">Employee</th>
              <th className="py-3.5 px-4 min-w-[100px]">Employee ID</th>
              <th className="py-3.5 px-4 min-w-[110px]">Department</th>
              <th className="py-3.5 px-4 min-w-[100px]">Attendance Date</th>
              <th className="py-3.5 px-4 min-w-[95px]">Check In</th>
              <th className="py-3.5 px-4 min-w-[95px]">Check Out</th>
              <th className="py-3.5 px-4 min-w-[85px]">Worked</th>
              <th className="py-3.5 px-4 min-w-[85px]">Pending</th>
              <th className="py-3.5 px-4 min-w-[75px]">Overtime</th>
              <th className="py-3.5 px-4 min-w-[75px] text-center">Is WFH</th>
              <th className="py-3.5 px-4 min-w-[100px]">Status</th>
              <th className="py-3.5 px-4 text-center w-14">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan="13" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiAlertCircle className="w-8 h-8 text-slate-400" />
                    <p className="font-semibold text-slate-700">No attendance records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filter parameters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((emp, index) => {
                const serialNum = startIndex + index + 1;
                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150 group"
                  >
                    {/* 1. # */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                      {serialNum}
                    </td>

                    {/* 2. Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Employee ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {emp.empId}
                      </span>
                    </td>

                    {/* 4. Department */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {emp.department}
                    </td>

                    {/* 5. Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                      {emp.date}
                    </td>

                    {/* 6. Check In */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-semibold">
                      {emp.checkIn}
                    </td>

                    {/* 7. Check Out */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {emp.checkOut}
                    </td>

                    {/* 8. Worked */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                      {emp.workedHours || emp.workingHours || "--"}
                    </td>

                    {/* 9. Pending */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500">
                      {emp.pendingHours || "0h 00m"}
                    </td>

                    {/* 10. Overtime */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {emp.overtime || "-"}
                    </td>

                    {/* 11. Is WFH */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          emp.isWFH === "Yes" || emp.attendanceType === "WFH" || emp.attendanceType === "Remote"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "text-slate-400"
                        }`}
                      >
                        {emp.isWFH === "Yes" || emp.attendanceType === "WFH" || emp.attendanceType === "Remote"
                          ? "Yes"
                          : "No"}
                      </span>
                    </td>

                    {/* 12. Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(emp.status)}
                    </td>

                    {/* 13. Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onViewRecord && onViewRecord(emp)}
                        aria-label={`View details for ${emp.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
