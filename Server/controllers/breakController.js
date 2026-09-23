import { BreakPolicy, BreakLog } from '../models/Break.js';
import mongoose from 'mongoose';

/**
 * @desc    Get break policies
 * @route   GET /api/breaks/policies
 */
export const getBreakPolicies = async (req, res) => {
  try {
    const { shiftType } = req.query;
    const filter = {};
    if (shiftType && shiftType !== 'All Shifts') filter.shiftType = shiftType;

    const policies = await BreakPolicy.find(filter).sort({ startTime: 1 });
    const formatted = policies.map((p) => ({
      _id: p._id,
      id: p.policyId || p._id.toString(),
      policyId: p.policyId || p._id.toString(),
      name: p.name,
      type: p.type,
      shiftType: p.shiftType,
      startTime: p.startTime,
      endTime: p.endTime,
      displayTime: p.displayTime || `${p.startTime} – ${p.endTime}`,
      durationMinutes: p.durationMinutes,
      isMandatory: p.isMandatory,
      alarmSound: p.alarmSound,
      autoAlertEnabled: p.autoAlertEnabled,
      description: p.description,
      location: p.location,
      allowance: p.allowance,
      color: p.color,
      createdBy: p.createdBy || 'EMP-HR01',
      createdByName: p.createdByName || 'HR Administrator',
      isActive: p.isActive,
      createdAt: p.createdAt ? p.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Add break policy (HR / Super Admin)
 * @route   POST /api/breaks/policies
 */
export const addBreakPolicy = async (req, res) => {
  try {
    const {
      name,
      type,
      shiftType,
      startTime,
      endTime,
      durationMinutes,
      location,
      allowance,
      alarmSound,
      isMandatory,
      autoAlertEnabled,
      description,
      color,
      createdBy,
      createdByName,
    } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Name, startTime, and endTime are required.' });
    }

    const policyId = req.body.policyId || req.body.id || `BRK-POL-${Date.now().toString().slice(-4)}`;
    const creatorId = req.user?.employeeId || createdBy || 'EMP-HR01';
    const creatorName = req.user?.name || req.user?.employeeName || createdByName || 'HR Administrator';

    const policy = await BreakPolicy.create({
      policyId,
      name: name.trim(),
      type: type || 'Lunch Break',
      shiftType: shiftType || 'Day Shift',
      startTime,
      endTime,
      displayTime: req.body.displayTime || `${startTime} – ${endTime}`,
      durationMinutes: Number(durationMinutes) || 30,
      isMandatory: Boolean(isMandatory),
      alarmSound: alarmSound || 'chime',
      autoAlertEnabled: autoAlertEnabled !== false,
      description: description ? description.trim() : `${name} scheduled for ${shiftType || 'Day Shift'}.`,
      location: location || 'Main Cafeteria',
      allowance: allowance || 'Standard Refreshment',
      color: color || {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-800',
        badge: 'bg-indigo-100 text-indigo-800',
        gradient: 'from-indigo-600 to-purple-600',
      },
      createdBy: creatorId,
      createdByName: creatorName,
      isActive: true,
    });

    const formatted = {
      _id: policy._id,
      id: policy.policyId,
      policyId: policy.policyId,
      name: policy.name,
      type: policy.type,
      shiftType: policy.shiftType,
      startTime: policy.startTime,
      endTime: policy.endTime,
      displayTime: policy.displayTime,
      durationMinutes: policy.durationMinutes,
      isMandatory: policy.isMandatory,
      alarmSound: policy.alarmSound,
      autoAlertEnabled: policy.autoAlertEnabled,
      description: policy.description,
      location: policy.location,
      allowance: policy.allowance,
      color: policy.color,
      createdBy: policy.createdBy,
      createdByName: policy.createdByName,
      isActive: policy.isActive,
      createdAt: policy.createdAt ? policy.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: policy.updatedAt ? policy.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };

    res.status(201).json({ success: true, message: 'Break policy created successfully.', data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Update break policy
 * @route   PUT /api/breaks/policies/:id
 */
export const updateBreakPolicy = async (req, res) => {
  try {
    const id = req.params.id;
    const policy = await BreakPolicy.findOne({
      $or: [
        { policyId: id },
        { _id: mongoose.isValidObjectId(id) ? id : null }
      ]
    });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Break policy not found.' });
    }

    if (req.body.name) policy.name = req.body.name.trim();
    if (req.body.type) policy.type = req.body.type;
    if (req.body.shiftType) policy.shiftType = req.body.shiftType;
    if (req.body.startTime) policy.startTime = req.body.startTime;
    if (req.body.endTime) policy.endTime = req.body.endTime;
    if (req.body.displayTime) policy.displayTime = req.body.displayTime;
    if (req.body.durationMinutes) policy.durationMinutes = Number(req.body.durationMinutes);
    if (req.body.isMandatory !== undefined) policy.isMandatory = req.body.isMandatory;
    if (req.body.alarmSound) policy.alarmSound = req.body.alarmSound;
    if (req.body.autoAlertEnabled !== undefined) policy.autoAlertEnabled = req.body.autoAlertEnabled;
    if (req.body.description !== undefined) policy.description = req.body.description;
    if (req.body.location !== undefined) policy.location = req.body.location;
    if (req.body.allowance !== undefined) policy.allowance = req.body.allowance;
    if (req.body.color) policy.color = req.body.color;
    if (req.body.isActive !== undefined) policy.isActive = req.body.isActive;

    await policy.save();

    const formatted = {
      _id: policy._id,
      id: policy.policyId,
      policyId: policy.policyId,
      name: policy.name,
      type: policy.type,
      shiftType: policy.shiftType,
      startTime: policy.startTime,
      endTime: policy.endTime,
      displayTime: policy.displayTime,
      durationMinutes: policy.durationMinutes,
      isMandatory: policy.isMandatory,
      alarmSound: policy.alarmSound,
      autoAlertEnabled: policy.autoAlertEnabled,
      description: policy.description,
      location: policy.location,
      allowance: policy.allowance,
      color: policy.color,
      createdBy: policy.createdBy,
      createdByName: policy.createdByName,
      isActive: policy.isActive,
      createdAt: policy.createdAt ? policy.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      updatedAt: policy.updatedAt ? policy.updatedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };

    res.json({ success: true, message: 'Break policy updated successfully.', data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Delete break policy
 * @route   DELETE /api/breaks/policies/:id
 */
export const deleteBreakPolicy = async (req, res) => {
  try {
    const id = req.params.id;
    const policy = await BreakPolicy.findOne({
      $or: [
        { policyId: id },
        { _id: mongoose.isValidObjectId(id) ? id : null }
      ]
    });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Break policy not found.' });
    }

    await BreakPolicy.deleteOne({ _id: policy._id });
    res.json({ success: true, message: 'Break policy deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Get break logs
 * @route   GET /api/breaks/logs
 */
export const getBreakLogs = async (req, res) => {
  try {
    const { employeeId, date, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'employee') filter.employeeId = req.user.employeeId;
    else if (employeeId) filter.employeeId = employeeId;
    if (date) filter.date = date;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await BreakLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await BreakLog.countDocuments(filter);

    res.json({
      success: true, data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Start a break
 * @route   POST /api/breaks/start
 */
export const startBreak = async (req, res) => {
  try {
    const { breakType, policyId } = req.body;
    if (!breakType) {
      return res.status(400).json({ success: false, message: 'breakType is required.' });
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const startTime = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    const date = now.toISOString().split('T')[0];

    // Check if already on break
    const activeBreak = await BreakLog.findOne({
      employeeId: req.user.employeeId,
      date,
      status: 'On Break',
    });

    if (activeBreak) {
      return res.status(400).json({ success: false, message: 'Already on a break. End current break first.' });
    }

    // Get policy for allowed minutes
    let allowedMinutes = 15;
    if (policyId) {
      const policy = await BreakPolicy.findOne({ policyId });
      if (policy) allowedMinutes = policy.durationMinutes;
    }

    const logId = `BL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const log = await BreakLog.create({
      logId,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      department: req.user.department,
      policyId: policyId || '',
      breakType,
      date,
      startTime,
      allowedMinutes,
      status: 'On Break',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('break:start', { employeeId: req.user.employeeId, breakType, startTime });
    }

    res.status(201).json({ success: true, message: `${breakType} started.`, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    End a break
 * @route   POST /api/breaks/end
 */
export const endBreak = async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const log = await BreakLog.findOne({
      employeeId: req.user.employeeId,
      date,
      status: 'On Break',
    });

    if (!log) {
      return res.status(400).json({ success: false, message: 'No active break found.' });
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const endTime = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

    // Calculate duration
    const startParts = log.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (startParts) {
      let startH = parseInt(startParts[1]);
      const startM = parseInt(startParts[2]);
      if (startParts[3].toUpperCase() === 'PM' && startH < 12) startH += 12;
      if (startParts[3].toUpperCase() === 'AM' && startH === 12) startH = 0;

      const startTotalMin = startH * 60 + startM;
      const endTotalMin = hours * 60 + minutes;
      const duration = endTotalMin - startTotalMin;

      log.durationMinutes = Math.max(0, duration);
      log.exceededMinutes = Math.max(0, duration - log.allowedMinutes);
      log.status = log.exceededMinutes > 0 ? 'Exceeded' : 'Completed';
    } else {
      log.status = 'Completed';
    }

    log.endTime = endTime;
    await log.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('break:end', { employeeId: req.user.employeeId, breakType: log.breakType, endTime, status: log.status });
    }

    res.json({ success: true, message: `Break ended. Status: ${log.status}.`, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
