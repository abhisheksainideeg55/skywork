import React, { useState } from "react";
import {
  FiX,
  FiPrinter,
  FiDownload,
  FiRepeat,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiEdit2,
  FiDroplet,
  FiCalendar,
  FiUser,
} from "react-icons/fi";

export default function EmployeeIdCardModal({
  employee,
  onClose,
  onOpenEdit,
  canEdit = true,
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  // QR Code URL generator
  const qrData = encodeURIComponent(
    `SKYWORK-ID:${employee.employeeId}|NAME:${employee.employeeName}|DEPT:${employee.department}|VALID:2028-12-31`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              🪪
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold">Official Employee ID Card</h3>
              <p className="text-[10px] text-slate-400">
                {employee.employeeName} ({employee.employeeId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Flip Card View"
            >
              <FiRepeat className="w-3.5 h-3.5" />
              <span>{isFlipped ? "Show Front" : "Show Back"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print / Save PDF"
            >
              <FiPrinter className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Canvas Container */}
        <div className="p-6 bg-slate-100/90 flex flex-col items-center justify-center">
          {/* Card Wrapper (3D perspective) */}
          <div className="w-full max-w-[320px] sm:max-w-[340px] transition-all duration-300">
            {!isFlipped ? (
              /* ========================================================= */
              /* FRONT SIDE OF ID CARD                                     */
              /* ========================================================= */
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative flex flex-col">
                {/* Lanyard Hole Clip */}
                <div className="w-12 h-2.5 bg-slate-300 rounded-full mx-auto mt-3 shadow-inner" />

                {/* Top Banner with Company Logo & Header */}
                <div className="px-5 pt-3 pb-8 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      SW
                    </div>
                    <span className="font-black text-sm tracking-tight">SKYWORK</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-indigo-300 font-bold mt-0.5">
                    Technologies Pvt. Ltd.
                  </p>
                </div>

                {/* Avatar Overlay */}
                <div className="-mt-7 flex justify-center relative z-10">
                  <div className="relative">
                    <img
                      src={employee.avatar}
                      alt={employee.employeeName}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-slate-50"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Active Staff" />
                  </div>
                </div>

                {/* Core Details */}
                <div className="px-5 pt-2 pb-5 text-center flex-1 space-y-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                      {employee.employeeName}
                    </h2>
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">
                      {employee.role}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold">
                      ID: {employee.employeeId}
                    </span>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-left bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-medium">Department</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {employee.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Blood Group</span>
                      <span className="font-bold text-rose-600">
                        {employee.bloodGroup || "O+"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Joining Date</span>
                      <span className="font-bold text-slate-800">
                        {employee.joiningDate || "12 Jan 2023"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Age / DOB</span>
                      <span className="font-bold text-slate-800">
                        {employee.age ? `${employee.age} Yrs` : "27 Yrs"}
                      </span>
                    </div>
                  </div>

                  {/* Contact Badges & QR Code */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="text-left space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <FiPhone className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{employee.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <FiMail className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-center">
                      <img
                        src={qrCodeUrl}
                        alt="Employee QR Code"
                        className="w-12 h-12 rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs"
                      />
                      <span className="text-[8px] text-slate-400 block font-mono mt-0.5">SCAN ME</span>
                    </div>
                  </div>
                </div>

                {/* Front Card Bottom Stripe */}
                <div className="h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600" />
              </div>
            ) : (
              /* ========================================================= */
              /* BACK SIDE OF ID CARD                                      */
              /* ========================================================= */
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative flex flex-col justify-between min-h-[440px]">
                {/* Lanyard Hole Clip */}
                <div className="w-12 h-2.5 bg-slate-300 rounded-full mx-auto mt-3 shadow-inner" />

                {/* Back Content */}
                <div className="p-5 space-y-4 text-left">
                  {/* Top Branding Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-800">
                      TERMS & VERIFICATION
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      SKYWORK-ID-{employee.employeeId}
                    </span>
                  </div>

                  {/* Important Property Guidelines */}
                  <div className="space-y-1.5 text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <FiShield className="w-3 h-3 text-indigo-600" />
                      <span>Company Property Notice:</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 text-[9.5px]">
                      <li>This card is the exclusive property of Skywork Technologies.</li>
                      <li>Must be visibly worn at all times within office premises.</li>
                      <li>If found, please return to the corporate address below.</li>
                    </ul>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-2.5 text-[10px] text-rose-950">
                    <span className="font-bold block text-rose-800 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Emergency Contact Number:</span>
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {employee.emergencyContact || "+91 91234 56789 (Mr. Ramesh Sharma)"}
                    </span>
                  </div>

                  {/* Corporate Office Address */}
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <FiMapPin className="w-3 h-3 text-slate-400" />
                      <span>Corporate Office Address:</span>
                    </span>
                    <p className="text-slate-500 pl-4 leading-tight text-[9.5px]">
                      Skywork Cyber Tech Park, Sector 44, Gurugram, Haryana - 122002, India.
                    </p>
                    <p className="text-slate-500 pl-4 text-[9px]">
                      HR Helpline: hr@skywork.io • +91 124 456 7890
                    </p>
                  </div>

                  {/* QR Code & Authorized Signature Stamp */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <img
                        src={qrCodeUrl}
                        alt="Security QR"
                        className="w-11 h-11 rounded-lg border border-slate-200 p-0.5 bg-white"
                      />
                      <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
                        Verify Authenticity
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic font-bold text-xs text-indigo-900">
                        Marcus Vance
                      </div>
                      <span className="text-[9px] font-bold text-slate-700 block uppercase tracking-wider">
                        Authorized Signatory
                      </span>
                      <span className="text-[8px] text-slate-400 block font-mono">
                        Valid Thru: {employee.idCardExpiry || "31 Dec 2028"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Card Bottom Stripe */}
                <div className="h-1.5 bg-linear-to-r from-purple-500 via-indigo-500 to-slate-900" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit && onOpenEdit(employee);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>Update KYC / Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Download Badge</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
