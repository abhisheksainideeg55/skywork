import Notification from '../models/Notification.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.user?.employeeId || req.user?.id;
    const filter = {};

    if (employeeId) {
      filter.$or = [{ employeeId }, { employeeId: 'ALL' }];
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      $or: [{ _id: req.params.id }, { notificationId: req.params.id }],
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user?.employeeId || req.user?.id;
    const filter = employeeId ? { $or: [{ employeeId }, { employeeId: 'ALL' }] } : {};

    await Notification.updateMany(filter, {
      $set: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create manual notification
 * @route   POST /api/notifications
 */
export const createNotification = async (req, res) => {
  try {
    const notificationId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const notification = new Notification({
      ...req.body,
      notificationId: req.body.notificationId || notificationId,
    });

    await notification.save();

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
