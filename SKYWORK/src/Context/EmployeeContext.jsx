import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  INITIAL_SALARY_RECORDS,
  INITIAL_GENERATED_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EMPLOYEE_DOCUMENTS,
  INITIAL_ANNOUNCEMENTS,
} from "../Data/employeeData";
import { getUsers } from "../Services/userService";
import api from "../Services/apiClient";

const EmployeeContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

const syncProfilesWithUsers = (existingProfiles = []) => {
  try {
    const allUsers = getUsers();
    // Only HR and Employee accounts created by SuperAdmin or HR
    const targetUsers = allUsers.filter(u => u.role === 'employee' || u.role === 'hr');
    const validNorms = new Set(targetUsers.map(u => normalizeId(u.id)));

    // Keep existing profiles that match valid target users
    const validProfiles = (Array.isArray(existingProfiles) ? existingProfiles : []).filter(p =>
      validNorms.has(normalizeId(p.employeeId || p.id))
    );

    // Ensure every user in targetUsers has an employee profile
    targetUsers.forEach(u => {
      const uNorm = normalizeId(u.id);
      const exists = validProfiles.some(p => normalizeId(p.employeeId || p.id) === uNorm);
      if (!exists) {
        validProfiles.push({
          id: u.id,
          employeeId: u.id,
          employeeName: u.name,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          role: u.role === 'hr' ? 'HR Operations' : 'Staff Employee',
          department: u.department || "General",
          email: u.email,
          mobileNumber: "+91 98765 43210",
          emergencyContact: "--",
          aadhaarNumber: "---- ---- ----",
          panNumber: "ABCDE1234F",
          bankName: "HDFC Bank",
          accountNumber: "50100489212345",
          ifscCode: "HDFC0001234",
          age: 26,
          dob: "01 Jan 1999",
          bloodGroup: "O+",
          address: "Skywork Tech Park, Sector 44",
          joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          idCardIssued: true,
          idCardIssueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          idCardExpiry: "31 Dec 2028",
          idCardTheme: u.role === 'hr' ? 'purple' : 'indigo',
        });
      }
    });

    return validProfiles;
  } catch (e) {
    return existingProfiles;
  }
};

export function EmployeeProvider({ children }) {
  // 1. Master Employee KYC & Profile State (strictly synced with created users)
  const [employees, setEmployees] = useState(() => syncProfilesWithUsers([]));

  // 2. Salary Records State
  const [salaries, setSalaries] = useState(() => INITIAL_SALARY_RECORDS);

  // 3. Reports State (synced strictly with MongoDB)
  const [reports, setReports] = useState([]);

  // 4. Notifications State
  const [notifications, setNotifications] = useState(() => INITIAL_NOTIFICATIONS);

  // 5. Documents State
  const [documents, setDocuments] = useState(() => INITIAL_EMPLOYEE_DOCUMENTS);

  // 6. Announcements State (HR & Manager can Create/Edit/Delete; Employees View)
  const [announcements, setAnnouncements] = useState(() => INITIAL_ANNOUNCEMENTS);

  // ==========================================
  // FETCH FROM BACKEND API ON MOUNT
  // ==========================================
  useEffect(() => {
    // Fetch employees from backend
    api.get("/employees").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiEmployees = json.data.map((e) => ({
          id: e.employeeId || e.id,
          employeeId: e.employeeId || e.id,
          employeeName: e.employeeName || e.name,
          avatar: e.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          role: e.role || e.designation || "Staff Employee",
          department: e.department || "General",
          email: e.email || "",
          mobileNumber: e.mobileNumber || "+91 98765 43210",
          emergencyContact: e.emergencyContact || "--",
          aadhaarNumber: e.aadhaarNumber || "---- ---- ----",
          panNumber: e.panNumber || "ABCDE1234F",
          bankName: e.bankName || "HDFC Bank",
          accountNumber: e.accountNumber || "50100489212345",
          ifscCode: e.ifscCode || "HDFC0001234",
          age: e.age || 26,
          dob: e.dob || "01 Jan 1999",
          bloodGroup: e.bloodGroup || "O+",
          address: e.address || "Skywork Tech Park, Sector 44",
          joiningDate: e.joiningDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: e.status || "Active",
          designation: e.designation || "Staff Employee",
          idCardIssued: e.idCardIssued !== undefined ? e.idCardIssued : true,
          idCardIssueDate: e.idCardIssueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          idCardExpiry: e.idCardExpiry || "31 Dec 2028",
          idCardTheme: e.idCardTheme || "indigo",
        }));
        setEmployees(apiEmployees);
      }
    }).catch(() => {
      // Backend offline — keep localStorage data
    });

    // Fetch announcements from backend
    api.get("/announcements").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiAnnouncements = json.data.map((a) => ({
          id: a.announcementId || a._id || a.id,
          _id: a._id,
          title: a.title,
          category: a.category || "Company Policy & Guidelines",
          priority: a.priority || "General",
          targetAudience: a.targetAudience || "All Employees",
          authorName: a.createdByName || a.authorName || "HR Admin",
          authorRole: a.authorRole || "HR Operations",
          authorAvatar: a.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          createdAt: a.createdAt || a.publishDate || new Date().toISOString(),
          pinned: a.isPinned || a.pinned || false,
          status: a.status || "Published",
          summary: a.summary || a.content || a.title,
          fullContent: a.fullContent || a.content || a.summary || a.title,
          attachments: a.attachments || [],
          acknowledgedBy: a.acknowledgedBy || [],
          viewsCount: a.viewsCount || 0,
          acknowledgeRequired: a.acknowledgeRequired || false,
        }));
        setAnnouncements(apiAnnouncements);
      }
    }).catch(() => {});

    // Fetch notifications from backend
    api.get("/notifications").then((json) => {
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const apiNotifs = json.data.map((n) => ({
          id: n.notificationId || n._id || n.id,
          _id: n._id,
          title: n.title,
          category: n.category || "General",
          priority: n.type === "warning" || n.type === "error" ? "Urgent" : "General",
          sender: n.senderName || "HR Admin",
          targetAudience: n.employeeId === "ALL" ? "All Employees" : n.employeeId,
          createdAt: n.createdAt || new Date().toISOString(),
          read: !!n.isRead,
          pinned: n.type === "warning",
          content: n.message || n.title,
          actionLink: n.actionUrl || "#",
          actionLabel: "View Details →",
        }));
        setNotifications(apiNotifs);
      }
    }).catch(() => {});

    // Fetch reports from backend
    api.get("/reports").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiReports = json.data.map((r) => ({
          id: r.reportId || r._id || r.id,
          _id: r._id,
          reportId: r.reportId || r.id,
          title: r.title,
          category: r.category || "Custom",
          employeeId: r.employeeId || "",
          employeeName: r.employeeName || "Employee",
          department: r.department || "General",
          format: r.format || "CSV / Excel",
          fileSize: r.fileSize || "1.8 MB",
          generatedBy: r.generatedBy || "HR Admin",
          dateGenerated: r.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          status: r.status || "Completed",
          downloadsCount: r.downloadCount || 0,
          description: r.description || "",
        }));
        setReports(apiReports);
      }
    }).catch(() => {});

    // Fetch documents from backend
    api.get("/documents").then((json) => {
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const apiDocs = json.data.map((d) => ({
          id: d.documentId || d._id || d.id,
          _id: d._id,
          documentName: d.documentName,
          category: d.category || d.documentType || "Identity & KYC",
          employeeId: d.employeeId,
          employeeName: d.employeeName,
          department: d.department || "General",
          fileFormat: d.fileFormat || "PDF",
          fileSize: d.fileSize || "1.5 MB",
          uploadedDate: d.uploadedAt?.split("T")[0] || d.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          expiryDate: d.expiryDate || "Permanent",
          verificationStatus: d.verificationStatus || "Pending Review",
          verifiedBy: d.verifiedBy || null,
          verifiedAt: d.verifiedAt || null,
          docNumber: d.docNumber || "",
          notes: d.notes || d.remarks || "",
          downloadUrl: d.fileUrl || "#",
        }));
        setDocuments(apiDocs);
      }
    }).catch(() => {});
  }, []);

  // Listen to user changes across the system (create, delete, update)
  useEffect(() => {
    const handleUsersChanged = () => {
      setEmployees((prev) => syncProfilesWithUsers(prev));
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    window.addEventListener("storage", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
      window.removeEventListener("storage", handleUsersChanged);
    };
  }, []);

  // Filter salaries to only include created employees
  useEffect(() => {
    const validNorms = new Set(employees.map((e) => normalizeId(e.employeeId || e.id)));
    setSalaries((prev) => {
      const filtered = prev.filter((s) => validNorms.has(normalizeId(s.employeeId || s.id)));
      return filtered.length !== prev.length ? filtered : prev;
    });
  }, [employees]);



  // ==========================================
  // EMPLOYEE KYC & ID CARD ACTIONS
  // ==========================================
  const updateEmployeeProfile = (employeeId, updatedFields) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, ...updatedFields } : emp
      )
    );

    // Sync to backend
    api.put(`/employees/${employeeId}`, updatedFields).catch(() => {});

    // Also sync avatar/name in salaries and documents
    if (updatedFields.avatar || updatedFields.employeeName) {
      setSalaries((prev) =>
        prev.map((s) =>
          s.employeeId === employeeId
            ? {
                ...s,
                avatar: updatedFields.avatar || s.avatar,
                employeeName: updatedFields.employeeName || s.employeeName,
              }
            : s
        )
      );
      setDocuments((prev) =>
        prev.map((d) =>
          d.employeeId === employeeId
            ? {
                ...d,
                employeeName: updatedFields.employeeName || d.employeeName,
              }
            : d
        )
      );
    }
  };

  const createOrUpdateIdCard = (employeeId, idCardConfig = {}) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedPayload = {
      ...idCardConfig,
      idCardIssued: true,
      idCardIssueDate: idCardConfig.idCardIssueDate || today,
      idCardExpiry: idCardConfig.idCardExpiry || "31 Dec 2028",
    };

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId
          ? {
              ...emp,
              ...updatedPayload,
            }
          : emp
      )
    );

    // Sync to backend MongoDB
    api.put(`/employees/${employeeId}`, updatedPayload).catch(() => {});
  };

  const getEmployeeById = (empId) => {
    return employees.find((e) => e.employeeId === empId) || employees[0];
  };

  // ==========================================
  // SALARY MUTATION ACTIONS
  // ==========================================
  const updateSalaryStructure = (salaryId, updatedFields) => {
    setSalaries((prev) =>
      prev.map((s) => {
        if (s.id !== salaryId) return s;
        const baseSalary = Number(updatedFields.baseSalary ?? s.baseSalary);
        const hra = Number(updatedFields.hra ?? s.hra);
        const specialAllowance = Number(updatedFields.specialAllowance ?? s.specialAllowance);
        const pfDeduction = Number(updatedFields.pfDeduction ?? s.pfDeduction);
        const taxDeduction = Number(updatedFields.taxDeduction ?? s.taxDeduction);
        const professionalTax = Number(updatedFields.professionalTax ?? s.professionalTax);

        const grossSalary = baseSalary + hra + specialAllowance;
        const totalDeductions = pfDeduction + taxDeduction + professionalTax;
        const netSalary = grossSalary - totalDeductions;
        const annualCTC = grossSalary * 12;

        return {
          ...s,
          ...updatedFields,
          baseSalary,
          hra,
          specialAllowance,
          pfDeduction,
          taxDeduction,
          professionalTax,
          grossSalary,
          netSalary,
          annualCTC,
        };
      })
    );
  };

  const toggleDisbursementStatus = (salaryId, newStatus = "Paid") => {
    const today = new Date().toISOString().split("T")[0];
    setSalaries((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              paymentStatus: newStatus,
              disbursementDate: newStatus === "Paid" ? today : "Pending (Scheduled)",
              payslipGenerated: newStatus === "Paid",
            }
          : s
      )
    );
  };

  const disburseAllPending = () => {
    const today = new Date().toISOString().split("T")[0];
    setSalaries((prev) =>
      prev.map((s) => ({
        ...s,
        paymentStatus: "Paid",
        disbursementDate: today,
        payslipGenerated: true,
      }))
    );
  };

  const generateNewReport = async ({
    title,
    category,
    format,
    description,
    department,
    employeeId,
    employeeName,
    generatedBy,
  }) => {
    const payload = {
      title: title || `${category} - ${employeeName || "Employee Audit"}`,
      category: category || "Performance & Appraisal Report",
      employeeId: employeeId || "EMP001",
      employeeName: employeeName || "Employee",
      department: department || "General",
      format: format || "CSV / Excel",
      fileSize: `${(Math.random() * 2 + 1.1).toFixed(1)} MB`,
      generatedBy: generatedBy || "HR Admin",
      status: "Completed",
      description:
        description ||
        `Generated analytics report for ${employeeName || "employee"} containing attendance, leave, and payroll records.`,
    };

    try {
      const json = await api.post("/reports", payload);
      if (json.success && json.data) {
        const saved = json.data;
        const newReport = {
          id: saved.reportId || saved._id,
          _id: saved._id,
          reportId: saved.reportId,
          title: saved.title,
          category: saved.category,
          employeeId: saved.employeeId,
          employeeName: saved.employeeName,
          department: saved.department,
          format: saved.format,
          fileSize: saved.fileSize || "1.8 MB",
          generatedBy: saved.generatedBy || "HR Admin",
          dateGenerated: saved.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          status: saved.status || "Completed",
          downloadsCount: 0,
          description: saved.description,
        };
        setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
        return newReport;
      }
    } catch (err) {
      console.error("Failed to save report to backend:", err);
      throw err;
    }
  };

  const updateReport = async (reportId, updatedFields) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId || r._id === reportId ? { ...r, ...updatedFields } : r))
    );

    try {
      await api.put(`/reports/${reportId}`, updatedFields);
    } catch (err) {
      console.warn("Failed to update report on backend:", err?.message);
    }
  };

  const deleteReport = async (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId && r._id !== reportId && r.reportId !== reportId));
    try {
      await api.delete(`/reports/${reportId}`);
    } catch (err) {
      console.warn("Failed to delete report on backend:", err?.message);
    }
  };

  const incrementReportDownload = (reportId) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r))
    );
    api.post(`/reports/${reportId}/download`).catch(() => {});
  };

  // ==========================================
  // NOTIFICATION ACTIONS & EVENT DISPATCHERS
  // ==========================================
  const createNotification = ({
    title,
    category,
    priority,
    sender,
    targetAudience,
    content,
    actionLink,
    actionLabel,
    pinned,
  }) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      category: category || "Company Announcement",
      priority: priority || "General",
      sender: sender || "Abhishek Sharma (HR Admin)",
      targetAudience: targetAudience || "All Employees",
      createdAt: new Date().toISOString(),
      read: false,
      pinned: pinned !== undefined ? pinned : priority === "Urgent",
      content,
      actionLink: actionLink || "#",
      actionLabel: actionLabel || "View Details →",
    };

    setNotifications((prev) => [newNotif, ...prev]);

    api.post("/notifications", {
      notificationId: newNotif.id,
      employeeId: targetAudience === "All Employees" ? "ALL" : targetAudience,
      title: newNotif.title,
      message: newNotif.content || newNotif.title,
      type: (priority || "").toLowerCase() === "urgent" ? "warning" : "info",
      category: newNotif.category,
      senderName: newNotif.sender,
      actionUrl: newNotif.actionLink,
    }).catch(() => {});

    return newNotif;
  };

  // 1. Salary received / credited notification
  const notifySalaryCredited = ({
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
    amount = "₹1,54,100",
    bankName = "HDFC Bank",
    accountLast4 = "2345",
  } = {}) => {
    return createNotification({
      title: `💵 Salary ${amount} Credited to ${bankName} A/c`,
      category: "Salary & Payroll",
      priority: "Urgent",
      sender: "Skywork Payroll Department",
      targetAudience: `${employeeName} (${employeeId})`,
      content: `Your net salary of ${amount} for current pay cycle has been disbursed to ${bankName} account (...${accountLast4}). Payslip has been generated and is available for instant download.`,
      actionLink: "/salary",
      actionLabel: "View My Payslip →",
      pinned: true,
    });
  };

  // 2. ID Card Created / Issued notification
  const notifyIdCardIssued = ({
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
  } = {}) => {
    return createNotification({
      title: `🪪 Smart Digital ID Card Generated & Active (${employeeId})`,
      category: "Employee ID Card",
      priority: "Important",
      sender: "HR Identity & Access Cell",
      targetAudience: `${employeeName} (${employeeId})`,
      content: `Your digital employee smart identity badge for ${employeeName} has been officially issued with tamper-proof QR validation. You can preview, 3D flip, or export high-res ID.`,
      actionLink: "/documents",
      actionLabel: "View Digital ID Card →",
      pinned: true,
    });
  };

  // 3. KYC Verified notification
  const notifyKycUpdated = ({
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
    kycType = "Aadhaar & PAN",
  } = {}) => {
    return createNotification({
      title: `🆔 KYC Verification Approved for ${employeeName}`,
      category: "KYC & Profile",
      priority: "Important",
      sender: "HR Compliance & Verification",
      targetAudience: `${employeeName} (${employeeId})`,
      content: `Your submitted ${kycType} credentials and banking details have been successfully verified and approved by HR Compliance. Profile compliance is 100%.`,
      actionLink: "/documents",
      actionLabel: "View KYC Profile →",
      pinned: false,
    });
  };

  // 4. Document uploaded / approved notification
  const notifyDocumentUploaded = ({
    documentName = "Degree Certificate",
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
    status = "Approved",
  } = {}) => {
    return createNotification({
      title: `📁 Document ${status}: ${documentName}`,
      category: "Document Vault",
      priority: "General",
      sender: "Document Verification Cell",
      targetAudience: `${employeeName} (${employeeId})`,
      content: `Your uploaded file "${documentName}" has been reviewed and marked as ${status} by the verification team. Archived in your secure repository.`,
      actionLink: "/documents",
      actionLabel: "Open Document Vault →",
      pinned: false,
    });
  };

  // 5. Leave Approved / Rejected / Half-Day notification
  const notifyLeaveStatus = ({
    leaveType = "Casual Leave",
    date = "24th Sep 2026",
    status = "Approved",
    managerName = "Marcus Vance (Engineering Lead)",
    days = "1 Day",
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
  } = {}) => {
    const isRejected = status.toLowerCase() === "rejected" || status.toLowerCase() === "declined";
    const isHalfDay = leaveType.toLowerCase().includes("half");

    return createNotification({
      title: isRejected
        ? `⚠️ ${leaveType} Request Declined (${date})`
        : isHalfDay
        ? `⏱️ Half-Day Leave Sanctioned (${date})`
        : `🏖️ ${leaveType} Request Approved (${date})`,
      category: "Leave & Attendance",
      priority: isRejected ? "Urgent" : "Important",
      sender: managerName,
      targetAudience: `${employeeName} (${employeeId})`,
      content: isRejected
        ? `Your ${days} ${leaveType} application for ${date} was declined due to sprint release deadlines. Please connect with ${managerName} to reschedule.`
        : `Your ${days} ${leaveType} application for ${date} has been approved by ${managerName}. Updated in attendance roster.`,
      actionLink: "/leave",
      actionLabel: "Check Leave Balance →",
      pinned: isRejected,
    });
  };

  // 6. Work From Home (WFH) Approved notification
  const notifyWfhStatus = ({
    date = "21st Sep 2026",
    status = "Approved",
    managerName = "Marcus Vance (Engineering Lead)",
    employeeName = "Abhishek Sharma",
    employeeId = "EMP001",
  } = {}) => {
    return createNotification({
      title: `🏠 Work From Home (WFH) Approved for ${date}`,
      category: "WFH & Remote",
      priority: "Important",
      sender: managerName,
      targetAudience: `${employeeName} (${employeeId})`,
      content: `Your remote work (WFH) request for ${date} has been approved by ${managerName}. Please remain active on Slack/Teams during core hours.`,
      actionLink: "/wfh",
      actionLabel: "View WFH Ticket →",
      pinned: false,
    });
  };

  // 7. Break notification (Lunch / Tea / Coffee break alarms)
  const notifyBreakAlert = ({
    breakName = "Lunch Break",
    duration = "60 Mins",
    timeWindow = "01:00 PM – 02:00 PM",
  } = {}) => {
    const isLunch = breakName.toLowerCase().includes("lunch");
    return createNotification({
      title: isLunch
        ? `🍱 Scheduled Lunch Break Alert (${timeWindow})`
        : `☕ ${breakName} Reminder (${duration})`,
      category: "Breaks & Shifts",
      priority: "General",
      sender: "Skywork Break Management",
      targetAudience: "All Employees (Day Shift)",
      content: `It's time for your ${duration} ${breakName} session (${timeWindow}). Step away from your desk and recharge!`,
      actionLink: "/breaks",
      actionLabel: isLunch ? "Start Lunch Break →" : "Start Break →",
      pinned: false,
    });
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const togglePinNotification = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const deleteNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // ==========================================
  // DOCUMENT REPOSITORY ACTIONS
  // ==========================================
  const uploadDocument = ({
    documentName,
    category,
    employeeId,
    employeeName,
    department,
    fileFormat,
    fileSize,
    docNumber,
    notes,
  }) => {
    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      documentName,
      category: category || "Identity & KYC",
      employeeId: employeeId || "EMP001",
      employeeName: employeeName || "Abhishek Sharma",
      department: department || "Engineering",
      fileFormat: fileFormat || "PDF",
      fileSize: fileSize || "1.8 MB",
      uploadedDate: new Date().toISOString().split("T")[0],
      expiryDate: "Permanent",
      verificationStatus: "Pending Review",
      verifiedBy: null,
      verifiedAt: null,
      docNumber: docNumber || "",
      notes: notes || "Newly uploaded employee document pending HR verification.",
      downloadUrl: "#",
    };

    setDocuments((prev) => [newDoc, ...prev]);

    api.post("/documents", {
      documentId: newDoc.id,
      employeeId: newDoc.employeeId,
      employeeName: newDoc.employeeName,
      department: newDoc.department,
      documentName: newDoc.documentName,
      category: newDoc.category,
      fileFormat: newDoc.fileFormat,
      fileSize: newDoc.fileSize,
      docNumber: newDoc.docNumber,
      notes: newDoc.notes,
      verificationStatus: newDoc.verificationStatus,
    }).then((json) => {
      if (json.success && json.data) {
        const sid = json.data.documentId || json.data._id;
        setDocuments((prev) =>
          prev.map((d) => (d.id === newDoc.id ? { ...d, id: sid, _id: json.data._id } : d))
        );
      }
    }).catch(() => {});

    // Dispatch event notification
    notifyDocumentUploaded({
      documentName,
      employeeName: employeeName || "Abhishek Sharma",
      employeeId: employeeId || "EMP001",
      status: "Uploaded & Pending Review",
    });

    return newDoc;
  };

  const verifyDocument = (docId, status = "Verified", reviewerNotes = "") => {
    const today = new Date().toISOString().split("T")[0];
    let verifiedDoc = null;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId || d._id === docId) {
          verifiedDoc = d;
          return {
            ...d,
            verificationStatus: status,
            verifiedBy: "Abhishek Sharma (HR Admin)",
            verifiedAt: today,
            notes:
              reviewerNotes ||
              (status === "Verified"
                ? "Document approved & verified."
                : d.notes),
          };
        }
        return d;
      })
    );

    // Sync to backend MongoDB
    api.put(`/documents/${docId}/verify`, {
      verificationStatus: status,
      remarks: reviewerNotes,
    }).catch((err) => {
      console.warn("Failed to update document status on backend:", err?.message);
    });

    if (verifiedDoc) {
      notifyDocumentUploaded({
        documentName: verifiedDoc.documentName,
        employeeName: verifiedDoc.employeeName,
        employeeId: verifiedDoc.employeeId,
        status: status,
      });
    }
  };

  const deleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId && d._id !== docId));
    api.del(`/documents/${docId}`).catch((err) => {
      console.warn("Failed to delete document on backend:", err?.message);
    });
  };

  // ==========================================
  // ANNOUNCEMENT MANAGEMENT ACTIONS (HR & MANAGER CRUD, USER VIEW)
  // ==========================================
  const createAnnouncement = ({
    title,
    category,
    priority,
    targetAudience,
    authorName = "Abhishek Sharma (HR Admin)",
    authorRole = "HR Operations",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    summary,
    fullContent,
    attachments = [],
    acknowledgeRequired = false,
    pinned = false,
    status = "Published",
  }) => {
    const newAnn = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title,
      category: category || "Company Policy & Guidelines",
      priority: priority || "General",
      targetAudience: targetAudience || "All Employees",
      authorName,
      authorRole,
      authorAvatar,
      createdAt: new Date().toISOString(),
      pinned: pinned || priority === "Urgent",
      status: status || "Published",
      summary: summary || title,
      fullContent: fullContent || summary || title,
      attachments: attachments.length ? attachments : [{ name: "Official_Announcement_Brief.pdf", size: "1.4 MB" }],
      acknowledgedBy: [],
      viewsCount: 1,
      acknowledgeRequired: !!acknowledgeRequired,
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    // Sync to backend API
    api.post("/announcements", {
      title: newAnn.title,
      category: newAnn.category,
      priority: newAnn.priority,
      targetAudience: newAnn.targetAudience,
      content: newAnn.fullContent || newAnn.summary,
      summary: newAnn.summary,
      createdByName: authorName,
      authorRole: authorRole,
      authorAvatar: authorAvatar,
      isPinned: newAnn.pinned,
      status: newAnn.status,
      acknowledgeRequired: newAnn.acknowledgeRequired,
    }).then((json) => {
      if (json.success && json.data) {
        const serverId = json.data.announcementId || json.data._id;
        const serverMongoId = json.data._id;
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === newAnn.id ? { ...a, id: serverId, _id: serverMongoId } : a))
        );
      }
    }).catch((err) => {
      console.warn("Failed to sync announcement to backend:", err?.message);
    });

    // Also trigger broadcast notification
    createNotification({
      title: `📢 Announcement: ${title}`,
      category: "Company Announcement",
      priority: priority || "General",
      sender: authorName,
      targetAudience: targetAudience || "All Employees",
      content: summary || title,
      actionLink: "/announcements",
      actionLabel: "Read Full Announcement →",
      pinned: pinned || priority === "Urgent",
    });

    return newAnn;
  };

  const updateAnnouncement = (annId, updatedFields) => {
    setAnnouncements((prev) =>
      prev.map((ann) => (ann.id === annId ? { ...ann, ...updatedFields } : ann))
    );

    // Sync to backend
    api.put(`/announcements/${annId}`, updatedFields).catch(() => {});
  };

  const deleteAnnouncement = (annId) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== annId));

    // Sync to backend
    api.del(`/announcements/${annId}`).catch(() => {});
  };

  const togglePinAnnouncement = (annId) => {
    let newPinned = false;
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === annId) {
          newPinned = !ann.pinned;
          return { ...ann, pinned: newPinned };
        }
        return ann;
      })
    );

    // Sync to backend
    api.put(`/announcements/${annId}`, { isPinned: newPinned }).catch(() => {});
  };

  const acknowledgeAnnouncement = (annId, empId = "EMP001") => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== annId) return ann;
        const currentList = ann.acknowledgedBy || [];
        if (currentList.includes(empId)) return ann;
        return {
          ...ann,
          acknowledgedBy: [...currentList, empId],
          viewsCount: (ann.viewsCount || 0) + 1,
        };
      })
    );
  };

  return (
    <EmployeeContext.Provider
      value={{
        // Master Employees & ID Card
        employees,
        updateEmployeeProfile,
        createOrUpdateIdCard,
        getEmployeeById,
        // Salary
        salaries,
        updateSalaryStructure,
        toggleDisbursementStatus,
        disburseAllPending,
        // Reports
        reports,
        generateNewReport,
        updateReport,
        deleteReport,
        incrementReportDownload,
        // Notifications & Event Triggers
        notifications,
        createNotification,
        notifySalaryCredited,
        notifyIdCardIssued,
        notifyKycUpdated,
        notifyDocumentUploaded,
        notifyLeaveStatus,
        notifyWfhStatus,
        notifyBreakAlert,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        togglePinNotification,
        deleteNotification,
        // Documents
        documents,
        uploadDocument,
        verifyDocument,
        deleteDocument,
        // Announcements (HR & Manager can Create/Edit/Delete, Employees can view & acknowledge)
        announcements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        acknowledgeAnnouncement,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
