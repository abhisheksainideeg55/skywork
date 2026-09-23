import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all generated employee reports (Filtered by RBAC)
 * @route   GET /api/reports
 */
export const getReports = async (req, res) => {
  try {
    const { category, status, employeeId, department, search } = req.query;
    const filter = {};

    // RBAC: If user is employee, restrict strictly to their own reports
    if (req.user && req.user.role === 'employee') {
      const userEmpId = req.user.employeeId || req.user.empId || req.user.id || req.user.email;
      filter.$or = [
        { employeeId: userEmpId },
        { employeeName: { $regex: req.user.name || '', $options: 'i' } },
      ];
    } else {
      // HR / Superadmin can filter by specific employee
      if (employeeId && employeeId !== 'ALL' && employeeId !== 'All Employees') {
        filter.employeeId = employeeId;
      }
      if (department && department !== 'All Departments') {
        filter.department = department;
      }
    }

    if (category && category !== 'All Categories') filter.category = category;
    if (status && status !== 'All Statuses') filter.status = status;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { employeeName: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    const reports = await Report.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
      meta: {
        total: reports.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate / record an employee report
 * @route   POST /api/reports
 */
export const generateReport = async (req, res) => {
  try {
    const count = await Report.countDocuments();
    const reportId = `REP-${String(count + 1).padStart(4, '0')}`;

    const report = new Report({
      ...req.body,
      reportId: req.body.reportId || reportId,
      generatedBy: req.user?.name || req.body.generatedBy || 'HR Admin',
      generatedAt: new Date(),
      status: req.body.status || 'Completed',
    });

    await report.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'REPORT_GENERATED',
      resource: 'Report',
      resourceId: report.reportId,
      details: {
        title: report.title,
        category: report.category,
        employeeId: report.employeeId,
        employeeName: report.employeeName,
      },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: report, message: 'Report generated and saved to database successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update report details
 * @route   PUT /api/reports/:id
 */
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }],
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    Object.assign(report, req.body);
    await report.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'REPORT_UPDATED',
      resource: 'Report',
      resourceId: report.reportId,
      details: { title: report.title, category: report.category },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: report, message: 'Report updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Track report download
 * @route   POST /api/reports/:id/download
 */
export const trackDownload = async (req, res) => {
  try {
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }],
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.downloadCount = (report.downloadCount || 0) + 1;
    await report.save();

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a report
 * @route   DELETE /api/reports/:id
 */
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }],
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'REPORT_DELETED',
      resource: 'Report',
      resourceId: report.reportId,
      details: { title: report.title, category: report.category },
      status: 'SUCCESS',
    });

    res.json({ success: true, message: 'Report removed from database successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
