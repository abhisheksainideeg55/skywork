import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get audit logs
 * @route   GET /api/audit-logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { module, action, userId, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (module) filter.module = module;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create manual audit log entry
 * @route   POST /api/audit-logs
 */
export const createAuditLog = async (req, res) => {
  try {
    const log = new AuditLog({
      ...req.body,
      userId: req.user?.id || req.body.userId || 'SYSTEM',
      userName: req.user?.name || req.body.userName || 'System User',
      userRole: req.user?.role || req.body.userRole || 'User',
      ipAddress: req.ip || req.body.ipAddress || '',
      userAgent: req.headers['user-agent'] || req.body.userAgent || '',
    });

    await log.save();
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
