import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get announcements
 * @route   GET /api/announcements
 */
export const getAnnouncements = async (req, res) => {
  try {
    const { category, priority, activeOnly } = req.query;
    const filter = {};

    if (category && category !== 'All Categories') filter.category = category;
    if (priority && priority !== 'All Priorities') filter.priority = priority;
    if (activeOnly === 'true') filter.isActive = true;

    const announcements = await Announcement.find(filter).sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 */
export const createAnnouncement = async (req, res) => {
  try {
    const count = await Announcement.countDocuments();
    const announcementId = `ANN-${String(count + 1).padStart(4, '0')}`;

    const announcement = new Announcement({
      ...req.body,
      announcementId: req.body.announcementId || req.body.id || announcementId,
      createdBy: req.user?.employeeId || req.user?.id || 'SYSTEM',
      createdByName: req.user?.name || req.body.createdByName || req.body.authorName || 'HR Admin',
      authorRole: req.user?.role || req.body.authorRole || 'HR Operations',
      publishDate: req.body.publishDate || new Date().toISOString().split('T')[0],
      status: req.body.status || 'Published',
    });

    await announcement.save();

    // Auto-create broadcast notification for all employees in MongoDB
    try {
      const notifId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await Notification.create({
        notificationId: notifId,
        employeeId: 'ALL',
        title: `📢 New Announcement: ${announcement.title}`,
        message: announcement.summary || announcement.content || announcement.title,
        type: announcement.priority === 'Urgent' ? 'warning' : 'announcement',
        category: announcement.category || 'Company Announcement',
        senderName: announcement.createdByName || 'HR Admin',
        actionUrl: '/announcements',
        isRead: false,
      });
    } catch (notifErr) {
      console.warn('Auto notification creation error:', notifErr.message);
    }

    try {
      await AuditLog.create({
        logId: `LOG-${Date.now()}`,
        userId: req.user?.employeeId || 'SYSTEM',
        userRole: req.user?.role || 'Admin',
        userName: req.user?.name || 'HR Admin',
        action: 'ANNOUNCEMENT_CREATED',
        targetId: announcement.announcementId,
        targetType: 'announcement',
        description: `Announcement "${announcement.title}" created by ${announcement.createdByName}.`,
        module: 'announcements',
      });
    } catch {
      // Non-blocking audit failure
    }

    res.status(201).json({ success: true, data: announcement, message: 'Announcement published successfully' });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      $or: [{ _id: req.params.id }, { announcementId: req.params.id }],
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    Object.assign(announcement, req.body);
    await announcement.save();

    res.json({ success: true, data: announcement, message: 'Announcement updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOneAndDelete({
      $or: [{ _id: req.params.id }, { announcementId: req.params.id }],
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
