import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import DocumentGridList from "../../../Components/Employee/Documents/DocumentGridList";
import UploadDocumentModal from "../../../Components/Employee/Documents/UploadDocumentModal";
import DocumentPreviewModal from "../../../Components/Employee/Documents/DocumentPreviewModal";
import EmployeeIdCardModal from "../../../Components/Employee/Documents/EmployeeIdCardModal";
import UpdateKycDetailsModal from "../../../Components/Employee/Documents/UpdateKycDetailsModal";
import { useEmployee } from "../../../Context/EmployeeContext";
import { FiUsers, FiUploadCloud } from "react-icons/fi";

export default function ManagerDocuments() {
  const { employees } = useEmployee();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [selectedIdCardEmp, setSelectedIdCardEmp] = useState(null);
  const [editingKycEmp, setEditingKycEmp] = useState(null);

  return (
    <div className="space-y-6">
      {/* Role Layout Switcher & Sub-tabs */}
      <EmployeeLayoutTabs activeTab="documents" />

      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Manager Team Hub
          </span>
          <h2 className="text-lg font-bold">Engineering Team Documents & ID Cards</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor and assist your direct reports with KYC proofs, emergency contacts, and digital ID badges.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setSelectedIdCardEmp(employees[0])}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>🪪</span>
            <span>View Team ID Badges</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <FiUploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Document Grid & Table (Manager Role) */}
      <DocumentGridList
        role="manager"
        currentUserEmpId="EMP001"
        onOpenPreview={(doc) => setSelectedPreviewDoc(doc)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenIdCard={(emp) => setSelectedIdCardEmp(emp)}
        onOpenEditKyc={(emp) => setEditingKycEmp(emp)}
      />

      {/* Modals */}
      {isUploadOpen && (
        <UploadDocumentModal onClose={() => setIsUploadOpen(false)} />
      )}

      {selectedPreviewDoc && (
        <DocumentPreviewModal
          document={selectedPreviewDoc}
          onClose={() => setSelectedPreviewDoc(null)}
        />
      )}

      {selectedIdCardEmp && (
        <EmployeeIdCardModal
          employee={selectedIdCardEmp}
          canEdit={true}
          onClose={() => setSelectedIdCardEmp(null)}
          onOpenEdit={(emp) => setEditingKycEmp(emp)}
        />
      )}

      {editingKycEmp && (
        <UpdateKycDetailsModal
          employee={editingKycEmp}
          onClose={() => setEditingKycEmp(null)}
        />
      )}
    </div>
  );
}
