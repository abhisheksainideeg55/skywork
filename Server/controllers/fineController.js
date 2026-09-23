import Fine from '../models/Fine.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all fines with filters
 * @route   GET /api/fines
 */
export const getFines = async (req, res) => {
  try {
    const { employeeId, status, category, effectiveMonth, search } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (effectiveMonth) filter.effectiveMonth = effectiveMonth;

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { fineNumber: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const fines = await Fine.find(filter).sort({ createdAt: -1 });

    const totalAmount = fines.reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingAmount = fines
      .filter((f) => f.status === 'Pending' || f.status === 'Approved')
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    res.json({
      success: true,
      data: fines,
      meta: {
        total: fines.length,
        totalAmount,
        pendingAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single fine
 * @route   GET /api/fines/:id
 */
export const getFineById = async (req, res) => {
  try {
    const fine = await Fine.findOne({
      $or: [{ _id: req.params.id }, { fineId: req.params.id }],
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    res.json({ success: true, data: fine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create / impose fine
 * @route   POST /api/fines
 */
export const createFine = async (req, res) => {
  try {
    const count = await Fine.countDocuments();
    const fineId = `FINE-${String(count + 1).padStart(4, '0')}`;
    const fineNumber = `FN-${Date.now().toString().slice(-6)}`;

    const fine = new Fine({
      ...req.body,
      fineId: req.body.fineId || fineId,
      fineNumber: req.body.fineNumber || fineNumber,
      imposedBy: req.user?.name || req.body.imposedBy || 'HR Admin',
    });

    await fine.save();

    if (fine.notifyEmployee) {
      await Notification.create({
        notificationId: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: fine.employeeId,
        title: 'Disciplinary Fine Imposed',
        message: `A fine of ₹${fine.amount} has been registered for: ${fine.reason || fine.category}`,
        type: 'fine',
        metadata: { fineId: fine.fineId, amount: fine.amount },
      });
    }

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'FINE_IMPOSED',
      resource: 'Fine',
      resourceId: fine.fineId,
      details: { employeeId: fine.employeeId, amount: fine.amount, category: fine.category },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: fine, message: 'Fine recorded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update fine status (Approve, Apply, Waive, Cancel)
 * @route   PUT /api/fines/:id/status
 */
export const updateFineStatus = async (req, res) => {
  try {
    const { status, waiverReason } = req.body;

    const fine = await Fine.findOne({
      $or: [{ _id: req.params.id }, { fineId: req.params.id }],
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    fine.status = status;
    if (status === 'Waived') {
      fine.waiverReason = waiverReason || '';
      fine.waivedBy = req.user?.name || 'Admin';
      fine.waivedAt = new Date();
    }

    await fine.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: `FINE_${status.toUpperCase()}`,
      resource: 'Fine',
      resourceId: fine.fineId,
      details: { status, waiverReason },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: fine, message: `Fine status updated to ${status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
