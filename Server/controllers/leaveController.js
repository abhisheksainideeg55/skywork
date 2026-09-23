import mongoose from 'mongoose';
import { Leave, LeaveBalance } from '../models/Leave.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get leave requests
 * @route   GET /api/leaves
 */
export const getLeaves = async (req, res) => {
  try {
    const { employeeId, status, leaveType, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'employee') {
      filter.employeeId = req.user.employeeId;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await Leave.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get leave balances for an employee
 * @route   GET /api/leaves/balances/:employeeId
 */
export const getLeaveBalance = async (req, res) => {
  try {
    const empId = req.params.employeeId;

    // Employees can only see their own balance
    if (req.user.role === 'employee' && req.user.employeeId !== empId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    let balance = await LeaveBalance.findOne({ employeeId: empId });
    if (!balance) {
      balance = await LeaveBalance.create({
        employeeId: empId,
        balances: { 'Casual Leave': 8, 'Sick Leave': 6, 'Earned Leave': 12, 'Emergency Leave': 3, 'Other': 2 },
      });
    }

    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Apply for leave (or half-day)
 * @route   POST /api/leaves
 */
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, isHalfDay, halfDayType } = req.body;

    if (!leaveType || !startDate) {
      return res.status(400).json({ success: false, message: 'leaveType and startDate are required.' });
    }

    // Calculate days
    const effectiveEndDate = isHalfDay ? startDate : (endDate || startDate);
    let totalDays = 1;
    if (isHalfDay) {
      totalDays = 0.5;
    } else {
      const start = new Date(startDate);
      const end = new Date(effectiveEndDate);
      totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    // Check balance
    const empId = req.user.employeeId;
    let balance = await LeaveBalance.findOne({ employeeId: empId });
    if (!balance) {
      balance = await LeaveBalance.create({
        employeeId: empId,
        balances: { 'Casual Leave': 8, 'Sick Leave': 6, 'Earned Leave': 12, 'Emergency Leave': 3, 'Other': 2 },
      });
    }

    const available = balance.balances.get(leaveType) || 0;
    if (available < totalDays) {
      return res.status(400).json({ success: false, message: `Insufficient ${leaveType} balance. Available: ${available}, Requested: ${totalDays}.` });
    }

    const leaveId = `LV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const leave = await Leave.create({
      leaveId,
      employeeId: empId,
      employeeName: req.user.name,
      department: req.user.department,
      leaveType,
      startDate,
      endDate: effectiveEndDate,
      totalDays,
      reason: reason || '',
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      isHalfDay: isHalfDay || false,
      halfDayType: halfDayType || '',
    });

    // Notify HR
    await Notification.create({
      notificationId: `NTF-${Date.now()}`,
      employeeId: 'HR001',
      title: 'New Leave Request',
      message: `${req.user.name} applied for ${isHalfDay ? `Half Day (${halfDayType || 'Half Day'})` : leaveType} (${totalDays} ${totalDays === 1 ? 'day' : 'days'}).`,
      type: 'leave',
      category: 'Leave Management',
      senderName: req.user.name,
      senderId: empId,
    });

    res.status(201).json({ success: true, message: 'Leave application submitted.', data: leave });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Approve / Reject / Reset leave (SuperAdmin or HR)
 * @route   PATCH /api/leaves/:id/status
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const isMongoId = mongoose.isValidObjectId(req.params.id);
    const query = isMongoId
      ? { $or: [{ leaveId: req.params.id }, { _id: req.params.id }] }
      : { leaveId: req.params.id };

    const leave = await Leave.findOne(query);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (!['Approved', 'Rejected', 'Pending', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    // Enforce Super Admin authority on HR requests
    const isHRRequest =
      (leave.employeeId && leave.employeeId.toUpperCase().startsWith('HR')) ||
      (leave.department && (leave.department.toLowerCase().includes('human resources') || leave.department.toLowerCase() === 'hr'));

    if (isHRRequest && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Super Admin can approve, reject, or update HR requests.',
      });
    }

    const prevStatus = leave.status;
    leave.status = status;

    if (status === 'Pending') {
      leave.approvedBy = '';
      leave.approvedOn = '';
      leave.rejectionReason = '';
    } else {
      leave.approvedBy = req.user.name;
      leave.approvedOn = new Date().toISOString().split('T')[0];
      if (rejectionReason) leave.rejectionReason = rejectionReason;
      if (status === 'Approved') leave.rejectionReason = '';
    }

    await leave.save();

    // Update balance if approved
    if (status === 'Approved' && prevStatus !== 'Approved') {
      const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId });
      if (balance) {
        const current = balance.balances.get(leave.leaveType) || 0;
        balance.balances.set(leave.leaveType, Math.max(0, current - leave.totalDays));
        await balance.save();
      }
    }

    // Restore balance if previously approved and now cancelled/rejected/pending
    if (prevStatus === 'Approved' && (status === 'Cancelled' || status === 'Rejected' || status === 'Pending')) {
      const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId });
      if (balance) {
        const current = balance.balances.get(leave.leaveType) || 0;
        balance.balances.set(leave.leaveType, current + leave.totalDays);
        await balance.save();
      }
    }

    // Notify employee
    await Notification.create({
      notificationId: `NTF-${Date.now()}`,
      employeeId: leave.employeeId,
      title: `Leave ${status}`,
      message: `Your ${leave.leaveType} request (${leave.startDate} to ${leave.endDate}) has been ${status.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: 'leave',
      category: 'Leave Management',
      senderName: req.user.name,
    });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user.employeeId,
      userRole: req.user.role,
      userName: req.user.name,
      action: `LEAVE_${status.toUpperCase()}`,
      targetId: leave.leaveId,
      targetType: 'leave',
      description: `Leave ${leave.leaveId} ${status.toLowerCase()} for ${leave.employeeName}.`,
      module: 'leaves',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(leave.employeeId).emit('leave:status', { leaveId: leave.leaveId, status });
    }

    res.json({ success: true, message: `Leave ${status.toLowerCase()}.`, data: leave });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Cancel leave (Employee self-cancel pending request)
 * @route   DELETE /api/leaves/:id
 */
export const cancelLeave = async (req, res) => {
  try {
    const isMongoId = mongoose.isValidObjectId(req.params.id);
    const query = isMongoId
      ? { $or: [{ leaveId: req.params.id }, { _id: req.params.id }] }
      : { leaveId: req.params.id };

    const leave = await Leave.findOne(query);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found.' });
    }

    if (req.user.role === 'employee' && leave.employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own leave.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled.' });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({ success: true, message: 'Leave cancelled.', data: leave });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
