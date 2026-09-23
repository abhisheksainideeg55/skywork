import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import DocumentSummary from "../../../Components/Employee/Documents/DocumentSummary";
import DocumentGridList from "../../../Components/Employee/Documents/DocumentGridList";
import UploadDocumentModal from "../../../Components/Employee/Documents/UploadDocumentModal";
import DocumentPreviewModal from "../../../Components/Employee/Documents/DocumentPreviewModal";
import EmployeeIdCardModal from "../../../Components/Employee/Documents/EmployeeIdCardModal";
import UpdateKycDetailsModal from "../../../Components/Employee/Documents/UpdateKycDetailsModal";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function HRDocumentManagement() {
  const { employees } = useEmployee();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [selectedIdCardEmp, setSelectedIdCardEmp] = useState(null);
  const [editingKycEmp, setEditingKycEmp] = useState(null);

  const handleOpenDefaultIdCard = () => {
    setSelectedIdCardEmp(employees[0] || null);
  };

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs */}
      <EmployeeLayoutTabs activeTab="documents" />

      {/* Document Summary KPIs & ID Card Trigger */}
      <DocumentSummary
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenIdCard={handleOpenDefaultIdCard}
      />

      {/* Document Vault Grid / Table */}
      <DocumentGridList
        role="hr"
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
          onSaved={(updated) => {
            if (selectedIdCardEmp && selectedIdCardEmp.employeeId === editingKycEmp.employeeId) {
              setSelectedIdCardEmp({ ...selectedIdCardEmp, ...updated });
            }
          }}
        />
      )}
    </div>
  );
}
