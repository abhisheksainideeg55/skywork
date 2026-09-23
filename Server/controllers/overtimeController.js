import Overtime from '../models/Overtime.js';
import Salary from '../models/Salary.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all overtime requests
 * @route   GET /api/overtimes
 */
export const getOvertimes = async (req, res) => {
  try {
    const { employeeId, status, month, year, search } = req.query;
    const filter = {};

    // If user is regular employee, only show their own overtimes
    if (req.user && req.user.role === 'employee') {
      filter.employeeId = req.user.employeeId || req.user.empId || employeeId;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) filter.status = status;
    if (month) filter.month = month;
    if (year) filter.year = Number(year);

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { project: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const overtimes = await Overtime.find(filter).sort({ createdAt: -1 });

    const totalHours = overtimes.reduce((sum, o) => sum + (o.overtimeHours || 0), 0);
    const approvedTotal = overtimes
      .filter((o) => o.status === 'Approved')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingCount = overtimes.filter((o) => o.status === 'Pending').length;

    res.json({
      success: true,
      data: overtimes,
      meta: {
        total: overtimes.length,
        totalHours,
        approvedTotal,
        pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new overtime request
 * @route   POST /api/overtimes
 */
export const createOvertime = async (req, res) => {
  try {
    const count = await Overtime.countDocuments();
    const overtimeId = `OT-${String(count + 1).padStart(4, '0')}`;

    const employeeId = req.body.employeeId || req.user?.employeeId || req.user?.empId;
    const employeeName = req.body.employeeName || req.user?.name || 'Employee';

    const overtime = new Overtime({
      ...req.body,
      overtimeId,
      employeeId,
      employeeName,
    });

    await overtime.save();

    // Create notification for HR / Admins
    try {
      await Notification.create({
        recipientRole: 'hr',
        title: 'New Overtime Request',
        message: `${employeeName} (${employeeId}) submitted ${overtime.overtimeHours} hrs overtime for ${overtime.date}.`,
        type: 'salary',
        relatedId: overtime.overtimeId,
      });
    } catch (nErr) {
      console.error('Failed to create notification:', nErr);
    }

    res.status(201).json({
      success: true,
      data: overtime,
      message: 'Overtime request submitted successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update overtime status (Approve / Reject)
 * @route   PUT /api/overtimes/:id/status
 */
export const updateOvertimeStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const overtime = await Overtime.findOne({
      $or: [
        { overtimeId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    });

    if (!overtime) {
      return res.status(404).json({ success: false, message: 'Overtime request not found' });
    }

    overtime.status = status || overtime.status;
    if (remarks !== undefined) overtime.remarks = remarks;

    if (status === 'Approved') {
      overtime.approvedBy = req.user?.name || 'HR Admin';
      overtime.approvedAt = new Date();

      // If approved, dynamically update or add to employee salary record in MongoDB
      try {
        const salary = await Salary.findOne({ employeeId: overtime.employeeId });
        if (salary) {
          salary.overtimePay = (salary.overtimePay || 0) + (overtime.totalAmount || 0);
          salary.netSalary =
            (salary.baseSalary || 0) +
            (salary.hra || 0) +
            (salary.specialAllowance || 0) +
            (salary.bonus || 0) +
            (salary.incentives || 0) +
            salary.overtimePay -
            (salary.providentFund || 0) -
            (salary.professionalTax || 0) -
            (salary.taxDeduction || 0) -
            (salary.fines || 0);
          await salary.save();
        }
      } catch (salErr) {
        console.error('Failed to sync overtime amount to salary record:', salErr);
      }
    }

    await overtime.save();

    // Notify employee
    try {
      await Notification.create({
        recipientId: overtime.employeeId,
        title: `Overtime Request ${overtime.status}`,
        message: `Your overtime of ${overtime.overtimeHours} hrs on ${overtime.date} was ${overtime.status.toLowerCase()} by HR.`,
        type: 'salary',
        relatedId: overtime.overtimeId,
      });
    } catch (nErr) {
      console.error('Failed to notify employee:', nErr);
    }

    // Audit log
    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: `OVERTIME_${overtime.status.toUpperCase()}`,
      resource: 'Overtime',
      resourceId: overtime.overtimeId,
      details: { status: overtime.status, amount: overtime.totalAmount },
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      data: overtime,
      message: `Overtime request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete overtime request
 * @route   DELETE /api/overtimes/:id
 */
export const deleteOvertime = async (req, res) => {
  try {
    const overtime = await Overtime.findOneAndDelete({
      $or: [
        { overtimeId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    });

    if (!overtime) {
      return res.status(404).json({ success: false, message: 'Overtime record not found' });
    }

    res.json({ success: true, message: 'Overtime record removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
