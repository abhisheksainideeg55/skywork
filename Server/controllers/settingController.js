import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all settings
 * @route   GET /api/settings
 */
export const getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const settings = await Setting.find(filter);

    // Convert array to key-value object map as well as list
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      success: true,
      data: settings,
      settingsMap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update or create setting
 * @route   PUT /api/settings/:key
 */
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, category, label, description } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key },
      {
        value,
        category: category || 'general',
        label: label || key,
        description: description || '',
        updatedBy: req.user?.name || 'SuperAdmin',
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'SuperAdmin',
      userName: req.user?.name || 'SuperAdmin',
      action: 'SETTING_UPDATED',
      resource: 'Setting',
      resourceId: key,
      details: { key, value },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: setting, message: `Setting '${key}' updated successfully` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
