import Holiday from '../models/Holiday.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all holidays
 * @route   GET /api/holidays
 */
export const getHolidays = async (req, res) => {
  try {
    const { year, type } = req.query;
    const filter = {};
    if (year && year !== 'All Years') filter.year = parseInt(year);
    if (type && type !== 'All Types') filter.type = type;

    const holidays = await Holiday.find(filter).sort({ date: 1 });
    
    // Normalize format to ensure frontend gets both id and holidayId
    const formatted = holidays.map((h) => ({
      _id: h._id,
      id: h.holidayId || h._id.toString(),
      holidayId: h.holidayId || h._id.toString(),
      name: h.name,
      date: h.date,
      day: h.day,
      type: h.type,
      duration: h.duration || 'Full Day',
      description: h.description,
      status: h.status || 'Active',
      isOptional: h.isOptional,
      applicableDepartments: h.applicableDepartments,
      year: h.year,
      createdBy: h.createdBy || 'HR Administrator',
      createdByName: h.createdByName || h.createdBy || 'HR Administrator',
      createdAt: h.createdAt ? h.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: h.updatedAt ? h.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Add holiday
 * @route   POST /api/holidays
 */
export const addHoliday = async (req, res) => {
  try {
    const { name, date, type, duration, description, status, createdBy, createdByName } = req.body;
    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'Name and date are required.' });
    }

    const yearPart = date.slice(0, 4) || new Date().getFullYear();
    const holidayId = req.body.holidayId || req.body.id || `HOL-${yearPart}-${Date.now().toString().slice(-4)}`;
    
    let day = req.body.day;
    if (!day) {
      try {
        const dt = new Date(date);
        day = dt.toLocaleDateString('en-US', { weekday: 'long' });
      } catch {
        day = 'Monday';
      }
    }

    const creatorName = req.user?.name || req.user?.employeeName || createdByName || 'HR Administrator';
    const creatorId = req.user?.employeeId || createdBy || 'EMP-HR01';

    // Duplicate check
    const existing = await Holiday.findOne({
      $or: [{ date }, { holidayId }]
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `A holiday already exists for this date (${existing.name}).` });
    }

    const holiday = await Holiday.create({
      holidayId,
      name: name.trim(),
      date,
      day,
      type: type || 'Company Holiday',
      duration: duration || 'Full Day',
      description: description ? description.trim() : `${name} celebration`,
      status: status || 'Active',
      year: parseInt(date.slice(0, 4)) || new Date(date).getFullYear(),
      createdBy: creatorId,
      createdByName: creatorName,
    });

    try {
      await AuditLog.create({
        logId: `LOG-${Date.now()}`,
        userId: creatorId,
        userRole: req.user?.role || 'hr',
        userName: creatorName,
        action: 'HOLIDAY_CREATED',
        targetId: holidayId,
        targetType: 'holiday',
        description: `Holiday "${name}" (${date}) added by ${creatorName}.`,
        module: 'leaves',
      });
    } catch (auditErr) {
      // Non-fatal
    }

    const formatted = {
      _id: holiday._id,
      id: holiday.holidayId,
      holidayId: holiday.holidayId,
      name: holiday.name,
      date: holiday.date,
      day: holiday.day,
      type: holiday.type,
      duration: holiday.duration,
      description: holiday.description,
      status: holiday.status,
      year: holiday.year,
      createdBy: holiday.createdBy,
      createdByName: holiday.createdByName,
      createdAt: holiday.createdAt ? holiday.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: holiday.updatedAt ? holiday.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };

    res.status(201).json({ success: true, message: 'Holiday added successfully.', data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Update holiday
 * @route   PUT /api/holidays/:id
 */
export const updateHoliday = async (req, res) => {
  try {
    const id = req.params.id;
    const holiday = await Holiday.findOne({
      $or: [
        { holidayId: id },
        { _id: mongoose.isValidObjectId(id) ? id : null }
      ]
    });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found.' });
    }

    if (req.body.name) holiday.name = req.body.name.trim();
    if (req.body.date) {
      holiday.date = req.body.date;
      holiday.year = parseInt(req.body.date.slice(0, 4)) || new Date(req.body.date).getFullYear();
      if (!req.body.day) {
        holiday.day = new Date(req.body.date).toLocaleDateString('en-US', { weekday: 'long' });
      }
    }
    if (req.body.day) holiday.day = req.body.day;
    if (req.body.type) holiday.type = req.body.type;
    if (req.body.duration) holiday.duration = req.body.duration;
    if (req.body.description !== undefined) holiday.description = req.body.description;
    if (req.body.status) holiday.status = req.body.status;

    await holiday.save();

    const formatted = {
      _id: holiday._id,
      id: holiday.holidayId,
      holidayId: holiday.holidayId,
      name: holiday.name,
      date: holiday.date,
      day: holiday.day,
      type: holiday.type,
      duration: holiday.duration,
      description: holiday.description,
      status: holiday.status,
      year: holiday.year,
      createdBy: holiday.createdBy,
      createdByName: holiday.createdByName,
      createdAt: holiday.createdAt ? holiday.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: holiday.updatedAt ? holiday.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };

    res.json({ success: true, message: 'Holiday updated successfully.', data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Delete holiday
 * @route   DELETE /api/holidays/:id
 */
export const deleteHoliday = async (req, res) => {
  try {
    const id = req.params.id;
    const holiday = await Holiday.findOne({
      $or: [
        { holidayId: id },
        { _id: mongoose.isValidObjectId(id) ? id : null }
      ]
    });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found.' });
    }

    await Holiday.deleteOne({ _id: holiday._id });
    res.json({ success: true, message: 'Holiday deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

