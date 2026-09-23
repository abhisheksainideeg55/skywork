import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import DocumentGridList from "../../../Components/Employee/Documents/DocumentGridList";
import DocumentPreviewModal from "../../../Components/Employee/Documents/DocumentPreviewModal";
import EmployeeIdCardModal from "../../../Components/Employee/Documents/EmployeeIdCardModal";
import UpdateKycDetailsModal from "../../../Components/Employee/Documents/UpdateKycDetailsModal";
import { useEmployee } from "../../../Context/EmployeeContext";
import { useAuth } from "../../../Context/AuthContext";
import { FiShield, FiUser, FiEdit2, FiInfo, FiDownload } from "react-icons/fi";

export default function UserDocuments() {
  const { employees } = useEmployee();
  const { user } = useAuth();

  const currentEmpId = user?.employeeId || user?.id || "EMP001";
  const myProfile = employees.find((e) => e.employeeId === currentEmpId) || employees[0] || {};

  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isEditingKycOpen, setIsEditingKycOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Role Layout Switcher & Sub-tabs */}
      <EmployeeLayoutTabs activeTab="documents" />

      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            My Identity & KYC Vault
          </span>
          <h2 className="text-lg font-bold">Personal Document Repository & Digital ID</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            View and manage your Aadhaar, PAN, Emergency Contact, Bank Details, and Digital ID Badge.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsIdCardOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <FiDownload className="w-4 h-4" />
            <span>Download My ID Card</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditingKycOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Update KYC Info</span>
          </button>
        </div>
      </div>

      {/* KYC Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FiUser className="text-indigo-600" />
            <span>My Verified KYC Profile</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsEditingKycOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Edit Profile →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Aadhaar Number</span>
            <span className="font-mono font-bold text-slate-800">
              {myProfile.aadhaarNumber || "4589 1234 5678"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">PAN Number</span>
            <span className="font-mono font-bold text-slate-800">
              {myProfile.panNumber || "ABCPS1234F"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Blood Group</span>
            <span className="font-bold text-rose-600">
              {myProfile.bloodGroup || "O+"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Age / DOB</span>
            <span className="font-bold text-slate-800">
              {myProfile.age} Yrs ({myProfile.dob})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Mobile Number</span>
            <span className="font-bold text-slate-800">
              {myProfile.mobileNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Emergency Contact</span>
            <span className="font-bold text-slate-800 truncate block">
              {myProfile.emergencyContact}
            </span>
          </div>
        </div>
      </div>

      {/* Info banner — Employee cannot upload, only HR can */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
        <FiInfo className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Documents are managed by HR. Contact your HR Admin to upload or update any official documents.</span>
      </div>

      {/* Document List (Strictly User's Own Documents — Read Only) */}
      <DocumentGridList
        role="user"
        currentUserEmpId={currentEmpId}
        onOpenPreview={(doc) => setSelectedPreviewDoc(doc)}
        onOpenIdCard={() => setIsIdCardOpen(true)}
        onOpenEditKyc={() => setIsEditingKycOpen(true)}
      />

      {/* Modals */}
      {selectedPreviewDoc && (
        <DocumentPreviewModal
          document={selectedPreviewDoc}
          onClose={() => setSelectedPreviewDoc(null)}
        />
      )}

      {isIdCardOpen && (
        <EmployeeIdCardModal
          employee={myProfile}
          canEdit={false}
          onClose={() => setIsIdCardOpen(false)}
        />
      )}

      {isEditingKycOpen && (
        <UpdateKycDetailsModal
          employee={myProfile}
          onClose={() => setIsEditingKycOpen(false)}
        />
      )}
    </div>
  );
}
