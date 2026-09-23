import mongoose from 'mongoose';
import WFH from '../models/WFH.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get WFH requests
 * @route   GET /api/wfh
 */
export const getWFHRequests = async (req, res) => {
  try {
    const { employeeId, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'employee') {
      filter.employeeId = req.user.employeeId;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await WFH.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await WFH.countDocuments(filter);

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
 * @desc    Apply for WFH
 * @route   POST /api/wfh
 */
export const applyWFH = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      reason,
      workPlan,
      contactNumber,
      wfhType = 'Regular Remote Work',
      duration = 'Full Day',
      isHalfDay = false,
      halfDayType = '',
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required.' });
    }

    let totalDays = 1;
    if (isHalfDay || duration === 'Half Day') {
      totalDays = 0.5;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    const wfhId = `WFH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const wfh = await WFH.create({
      wfhId,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      department: req.user.department,
      wfhType,
      duration: isHalfDay ? 'Half Day' : duration,
      isHalfDay: isHalfDay || duration === 'Half Day',
      halfDayType: halfDayType || '',
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      totalDays,
      reason: reason || '',
      workPlan: workPlan || '',
      contactNumber: contactNumber || '',
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });

    await Notification.create({
      notificationId: `NTF-${Date.now()}`,
      employeeId: 'HR001',
      title: 'New WFH Request',
      message: `${req.user.name} applied for WFH (${totalDays} ${totalDays === 1 ? 'day' : 'days'}: ${startDate} to ${endDate}).`,
      type: 'info',
      category: 'WFH Management',
      senderName: req.user.name,
      senderId: req.user.employeeId,
    });

    res.status(201).json({ success: true, message: 'WFH request submitted.', data: wfh });
  } catch (error) {
    console.error('Apply WFH error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Approve / Reject / Reset WFH (SuperAdmin or HR)
 * @route   PATCH /api/wfh/:id/status
 */
export const updateWFHStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const isMongoId = mongoose.isValidObjectId(req.params.id);
    const query = isMongoId
      ? { $or: [{ wfhId: req.params.id }, { _id: req.params.id }] }
      : { wfhId: req.params.id };

    const wfh = await WFH.findOne(query);

    if (!wfh) return res.status(404).json({ success: false, message: 'WFH request not found.' });

    if (!['Approved', 'Rejected', 'Pending', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    // If target request belongs to HR, strictly enforce Super Admin authority
    const isHRRequest =
      (wfh.employeeId && wfh.employeeId.toUpperCase().startsWith('HR')) ||
      (wfh.department && (wfh.department.toLowerCase().includes('human resources') || wfh.department.toLowerCase() === 'hr'));

    if (isHRRequest && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Super Admin can approve, reject, or update HR requests.',
      });
    }

    wfh.status = status;
    if (status === 'Pending') {
      wfh.approvedBy = '';
      wfh.approvedOn = '';
      wfh.rejectionReason = '';
    } else {
      wfh.approvedBy = req.user.name;
      wfh.approvedOn = new Date().toISOString().split('T')[0];
      if (rejectionReason) wfh.rejectionReason = rejectionReason;
      if (status === 'Approved') wfh.rejectionReason = '';
    }

    await wfh.save();

    await Notification.create({
      notificationId: `NTF-${Date.now()}`,
      employeeId: wfh.employeeId,
      title: `WFH ${status}`,
      message: `Your WFH request (${wfh.startDate} to ${wfh.endDate}) has been ${status.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: status === 'Approved' ? 'success' : 'warning',
      category: 'WFH Management',
      senderName: req.user.name,
    });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user.employeeId,
      userRole: req.user.role,
      userName: req.user.name,
      action: `WFH_${status.toUpperCase()}`,
      targetId: wfh.wfhId,
      targetType: 'wfh',
      description: `WFH ${wfh.wfhId} ${status.toLowerCase()} for ${wfh.employeeName}.`,
      module: 'wfh',
    });

    res.json({ success: true, message: `WFH ${status.toLowerCase()}.`, data: wfh });
  } catch (error) {
    console.error('Update WFH status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Cancel WFH request (Employee self-cancel pending request)
 * @route   DELETE /api/wfh/:id
 */
export const cancelWFH = async (req, res) => {
  try {
    const isMongoId = mongoose.isValidObjectId(req.params.id);
    const query = isMongoId
      ? { $or: [{ wfhId: req.params.id }, { _id: req.params.id }] }
      : { wfhId: req.params.id };

    const wfh = await WFH.findOne(query);
    if (!wfh) {
      return res.status(404).json({ success: false, message: 'WFH request not found.' });
    }

    if (req.user.role === 'employee' && wfh.employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own WFH request.' });
    }

    if (wfh.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending WFH requests can be cancelled.' });
    }

    wfh.status = 'Cancelled';
    await wfh.save();

    res.json({ success: true, message: 'WFH request cancelled.', data: wfh });
  } catch (error) {
    console.error('Cancel WFH error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
