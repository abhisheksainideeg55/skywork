import React, { useState, useMemo } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import SalaryHeader from "../../../Components/Employee/Salary/SalaryHeader";
import SalarySummaryCards from "../../../Components/Employee/Salary/SalarySummaryCards";
import SalaryFilterToolbar from "../../../Components/Employee/Salary/SalaryFilterToolbar";
import SalaryTableView from "../../../Components/Employee/Salary/SalaryTableView";
import SalaryCardsView from "../../../Components/Employee/Salary/SalaryCardsView";
import ViewSalaryModal from "../../../Components/Employee/Salary/ViewSalaryModal";
import AddEditSalaryModal from "../../../Components/Employee/Salary/AddEditSalaryModal";
import IncrementSalaryModal from "../../../Components/Employee/Salary/IncrementSalaryModal";
import DecrementSalaryModal from "../../../Components/Employee/Salary/DecrementSalaryModal";
import SalaryHistoryModal from "../../../Components/Employee/Salary/SalaryHistoryModal";
import PayrollSummaryModal from "../../../Components/Employee/Salary/PayrollSummaryModal";
import PayrollHistoryLockModal from "../../../Components/Employee/Salary/PayrollHistoryLockModal";
import SalaryAuditLogsModal from "../../../Components/Employee/Salary/SalaryAuditLogsModal";
import PayslipModal from "../../../Components/Employee/Salary/PayslipModal";
import ImposeFineModal from "../../../Components/Employee/Salary/ImposeFineModal";
import ManageFinesModal from "../../../Components/Employee/Salary/ManageFinesModal";
import ManageDeductionsAdvancesModal from "../../../Components/Employee/Salary/ManageDeductionsAdvancesModal";
import ManageBonusesOvertimeModal from "../../../Components/Employee/Salary/ManageBonusesOvertimeModal";
import SalaryReportsModal from "../../../Components/Employee/Salary/SalaryReportsModal";
import UnauthorizedAccess from "../../../Components/Auth/UnauthorizedAccess";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";
import { FiCheckCircle, FiLayers, FiTrendingUp, FiAlertTriangle, FiGift, FiMinusCircle, FiFileText, FiShield } from "react-icons/fi";

export default function HRSalaryManagementPage({ userRole = "hr" }) {
  const { currentUser, hasPermission } = useAuth();

  // ── ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN ──
  const {
    salaries,
    summaryMetrics,
    currentMonth,
    currentYear,
  } = useSalary();

  // Active View Tab inside Salary Hub
  const [activeTab, setActiveTab] = useState("directory");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedDesignation, setSelectedDesignation] = useState("All Designations");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("all");
  const [sortBy, setSortBy] = useState("recently_updated");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Control States
  const [viewModalRecord, setViewModalRecord] = useState(null);
  const [addEditRecord, setAddEditRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [incrementRecord, setIncrementRecord] = useState(null);
  const [decrementRecord, setDecrementRecord] = useState(null);
  const [historyRecord, setHistoryRecord] = useState(null);
  const [payslipRecord, setPayslipRecord] = useState(null);
  const [isPayrollSummaryOpen, setIsPayrollSummaryOpen] = useState(false);
  const [isPayrollLockOpen, setIsPayrollLockOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isManageFinesOpen, setIsManageFinesOpen] = useState(false);
  const [imposeFineRecord, setImposeFineRecord] = useState(null);
  const [isImposeFineOpen, setIsImposeFineOpen] = useState(false);
  const [isDeductionsModalOpen, setIsDeductionsModalOpen] = useState(false);
  const [isBonusesModalOpen, setIsBonusesModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState("");

  // ── AUTHORIZATION GUARD (after all hooks) ──
  const isAuthorized =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "hr" ||
    hasPermission("salary.view");

  if (!isAuthorized) {
    return (
      <UnauthorizedAccess
        requiredRole="HR Administrator"
        currentRole={currentUser?.role || "Employee"}
        moduleName="HR Salary & Compensation Management"
      />
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Distinct Filter Options
  const departments = useMemo(() => {
    return Array.from(new Set(salaries.map((s) => s.department).filter(Boolean)));
  }, [salaries]);

  const designations = useMemo(() => {
    return Array.from(new Set(salaries.map((s) => s.role).filter(Boolean)));
  }, [salaries]);

  // Filtered & Sorted Salaries
  const filteredAndSortedSalaries = useMemo(() => {
    let result = salaries.filter((item) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        search === "" ||
        item.employeeName?.toLowerCase().includes(search) ||
        item.employeeId?.toLowerCase().includes(search) ||
        item.role?.toLowerCase().includes(search) ||
        item.department?.toLowerCase().includes(search);

      const matchesDept =
        selectedDept === "All Departments" || item.department === selectedDept;

      const matchesDesignation =
        selectedDesignation === "All Designations" || item.role === selectedDesignation;

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        item.status?.toLowerCase() === selectedStatus.toLowerCase();

      // Salary Range filter
      let matchesRange = true;
      const gross = item.grossSalary || item.currentSalary || 0;
      if (selectedSalaryRange === "under_50k") matchesRange = gross < 50000;
      else if (selectedSalaryRange === "50k_100k") matchesRange = gross >= 50000 && gross <= 100000;
      else if (selectedSalaryRange === "100k_150k") matchesRange = gross > 100000 && gross <= 150000;
      else if (selectedSalaryRange === "above_150k") matchesRange = gross > 150000;

      return matchesSearch && matchesDept && matchesDesignation && matchesStatus && matchesRange;
    });

    // Sorting
    result.sort((a, b) => {
      const grossA = a.grossSalary || a.currentSalary || 0;
      const grossB = b.grossSalary || b.currentSalary || 0;

      if (sortBy === "highest_salary") return grossB - grossA;
      if (sortBy === "lowest_salary") return grossA - grossB;
      if (sortBy === "name_asc") return a.employeeName.localeCompare(b.employeeName);
      // default: recently_updated
      return new Date(b.lastRevision || b.effectiveFrom || 0) - new Date(a.lastRevision || a.effectiveFrom || 0);
    });

    return result;
  }, [
    salaries,
    searchTerm,
    selectedDept,
    selectedDesignation,
    selectedStatus,
    selectedSalaryRange,
    sortBy,
  ]);

  // Paginated Slices
  const paginatedSalaries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSalaries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSalaries, currentPage, itemsPerPage]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDept("All Departments");
    setSelectedDesignation("All Designations");
    setSelectedStatus("All Statuses");
    setSelectedMonth("All Months");
    setSelectedSalaryRange("all");
    setSortBy("recently_updated");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Success Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Main Salary Dashboard Header Banner */}
      <SalaryHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        pendingFinesCount={summaryMetrics.pendingPayroll}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenPayrollSummary={() => setIsPayrollSummaryOpen(true)}
        onOpenPayrollLock={() => setIsPayrollLockOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenManageFines={() => setIsManageFinesOpen(true)}
        onOpenDeductions={() => setIsDeductionsModalOpen(true)}
        onOpenBonuses={() => setIsBonusesModalOpen(true)}
        onOpenReports={() => setIsReportsModalOpen(true)}
      />

      {/* 4. KPI Summary Stat Cards (All 9 Required Cards) */}
      <SalarySummaryCards />

      {/* 5. Filter & Search Toolbar */}
      <SalaryFilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedDesignation={selectedDesignation}
        setSelectedDesignation={setSelectedDesignation}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedSalaryRange={selectedSalaryRange}
        setSelectedSalaryRange={setSelectedSalaryRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        departments={departments}
        designations={designations}
        onClearFilters={handleClearFilters}
        totalResultsCount={filteredAndSortedSalaries.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />

      {/* 6. Employee Salary Table (Desktop View) */}
      <SalaryTableView
        salaries={paginatedSalaries}
        onViewSalary={(s) => setViewModalRecord(s)}
        onEditSalary={(s) => setAddEditRecord(s)}
        onIncrementSalary={(s) => setIncrementRecord(s)}
        onDecrementSalary={(s) => setDecrementRecord(s)}
        onViewHistory={(s) => setHistoryRecord(s)}
        onGeneratePayslip={(s) => setPayslipRecord(s)}
        onAddBonus={(s) => setIsBonusesModalOpen(true)}
        onAddDeduction={(s) => setIsDeductionsModalOpen(true)}
        onImposeFine={(s) => {
          setImposeFineRecord(s);
          setIsImposeFineOpen(true);
        }}
      />

      {/* 7. Employee Salary Cards View (Mobile/Tablet View) */}
      <SalaryCardsView
        salaries={paginatedSalaries}
        onViewSalary={(s) => setViewModalRecord(s)}
        onEditSalary={(s) => setAddEditRecord(s)}
        onIncrementSalary={(s) => setIncrementRecord(s)}
        onDecrementSalary={(s) => setDecrementRecord(s)}
        onViewHistory={(s) => setHistoryRecord(s)}
        onGeneratePayslip={(s) => setPayslipRecord(s)}
        onAddBonus={(s) => setIsBonusesModalOpen(true)}
        onAddDeduction={(s) => setIsDeductionsModalOpen(true)}
        onImposeFine={(s) => {
          setImposeFineRecord(s);
          setIsImposeFineOpen(true);
        }}
      />

      {/* ================================================= */}
      {/* MODAL DIALOGS */}
      {/* ================================================= */}

      {/* View Full Salary Breakdown Modal */}
      {viewModalRecord && (
        <ViewSalaryModal
          record={viewModalRecord}
          onClose={() => setViewModalRecord(null)}
          onOpenIncrement={(r) => setIncrementRecord(r)}
          onOpenDecrement={(r) => setDecrementRecord(r)}
          onOpenHistory={(r) => setHistoryRecord(r)}
          onOpenPayslip={(r) => setPayslipRecord(r)}
          onImposeFine={(r) => {
            setImposeFineRecord(r);
            setIsImposeFineOpen(true);
          }}
        />
      )}

      {/* Add New Salary Structure Modal */}
      {isAddModalOpen && (
        <AddEditSalaryModal
          record={null}
          onClose={() => setIsAddModalOpen(false)}
          onSaveSuccess={() => showToast("New employee salary structure created successfully!")}
        />
      )}

      {/* Edit Salary Structure Modal */}
      {addEditRecord && (
        <AddEditSalaryModal
          record={addEditRecord}
          onClose={() => setAddEditRecord(null)}
          onSaveSuccess={() => showToast(`Salary structure for ${addEditRecord.employeeName} updated successfully!`)}
        />
      )}

      {/* Increment Salary Modal */}
      {incrementRecord && (
        <IncrementSalaryModal
          record={incrementRecord}
          onClose={() => setIncrementRecord(null)}
          onSuccess={() => showToast(`Salary increment applied successfully for ${incrementRecord.employeeName}!`)}
        />
      )}

      {/* Decrement Salary Modal */}
      {decrementRecord && (
        <DecrementSalaryModal
          record={decrementRecord}
          onClose={() => setDecrementRecord(null)}
          onSuccess={() => showToast(`Salary decrement recorded successfully for ${decrementRecord.employeeName}!`)}
        />
      )}

      {/* Salary History Modal */}
      {historyRecord && (
        <SalaryHistoryModal
          record={historyRecord}
          onClose={() => setHistoryRecord(null)}
        />
      )}

      {/* Payslip Modal */}
      {payslipRecord && (
        <PayslipModal
          record={payslipRecord}
          onClose={() => setPayslipRecord(null)}
        />
      )}

      {/* Impose Fine Modal */}
      {isImposeFineOpen && (
        <ImposeFineModal
          isOpen={isImposeFineOpen}
          selectedEmployee={imposeFineRecord}
          onClose={() => {
            setIsImposeFineOpen(false);
            setImposeFineRecord(null);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Manage Fines Modal */}
      {isManageFinesOpen && (
        <ManageFinesModal
          isOpen={isManageFinesOpen}
          onClose={() => setIsManageFinesOpen(false)}
          onOpenImposeModal={() => {
            setImposeFineRecord(null);
            setIsImposeFineOpen(true);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Manage Deductions & Advances Modal */}
      {isDeductionsModalOpen && (
        <ManageDeductionsAdvancesModal
          isOpen={isDeductionsModalOpen}
          onClose={() => setIsDeductionsModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Manage Bonuses & Overtime Modal */}
      {isBonusesModalOpen && (
        <ManageBonusesOvertimeModal
          isOpen={isBonusesModalOpen}
          onClose={() => setIsBonusesModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Payroll Workflow & Processing Modal */}
      {isPayrollSummaryOpen && (
        <PayrollSummaryModal
          isOpen={isPayrollSummaryOpen}
          onClose={() => setIsPayrollSummaryOpen(false)}
          onDisburseSuccess={() => showToast("Monthly payroll processed and disbursed successfully!")}
        />
      )}

      {/* Payroll History & Period Locking Modal */}
      {isPayrollLockOpen && (
        <PayrollHistoryLockModal
          isOpen={isPayrollLockOpen}
          onClose={() => setIsPayrollLockOpen(false)}
        />
      )}

      {/* Security Audit Trail Logs Modal */}
      {isAuditLogsOpen && (
        <SalaryAuditLogsModal
          isOpen={isAuditLogsOpen}
          onClose={() => setIsAuditLogsOpen(false)}
        />
      )}

      {/* Salary Reports & Analytics Modal */}
      {isReportsModalOpen && (
        <SalaryReportsModal
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
        />
      )}
    </div>
  );
}
