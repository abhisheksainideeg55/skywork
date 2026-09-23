import Attendance from '../models/Attendance.js';
import { calculateAttendanceHours, getCurrentTimeFormatted, getTodayFormatted, getTodayRaw } from '../utils/attendanceEngine.js';

/**
 * @desc    Get attendance records (filtered)
 * @route   GET /api/attendance
 */
export const getAttendance = async (req, res) => {
  try {
    const { employeeId, date, month, year, department, status, page = 1, limit = 100 } = req.query;
    const filter = {};

    const userRole = (req.user?.role || '').toLowerCase();
    const userEmpId = req.user?.employeeId || req.user?.id;

    // Employees can only see their own records
    if (userRole === 'employee' || userRole === 'user') {
      filter.employeeId = userEmpId;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (date) filter.date = date;
    if (department && department !== 'All Departments') filter.department = department;
    if (status && status !== 'All Status') filter.status = status;

    if (month && year) {
      const mm = String(month).padStart(2, '0');
      filter.dateRaw = { $regex: `^${year}-${mm}` };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await Attendance.find(filter)
      .sort({ dateRaw: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Get today's status for current user
 * @route   GET /api/attendance/today
 */
export const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayFormatted();
    const empId = req.query.employeeId || req.user?.employeeId || req.user?.id;

    const record = await Attendance.findOne({
      $or: [
        { employeeId: empId, date: today },
        { employeeId: empId, dateRaw: getTodayRaw() },
      ],
    });

    res.json({
      success: true,
      data: record || { employeeId: empId, date: today, status: 'Absent', checkIn: '--:--', checkOut: '--:--' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Punch in (check-in) - Saves directly to MongoDB database
 * @route   POST /api/attendance/check-in
 */
export const checkIn = async (req, res) => {
  try {
    const today = getTodayFormatted();
    const todayRaw = getTodayRaw();
    const empId = req.body.employeeId || req.user?.employeeId || req.user?.id || 'EMP001';
    const empName = req.body.employeeName || req.user?.name || req.user?.employeeName || 'Employee';
    const dept = req.body.department || req.user?.department || 'Engineering';
    const checkInTime = req.body.checkInTime || getCurrentTimeFormatted();

    let record = await Attendance.findOne({
      $or: [
        { employeeId: empId, date: today },
        { employeeId: empId, dateRaw: todayRaw },
      ],
    });

    if (record && record.checkIn && record.checkIn !== '--:--') {
      return res.status(400).json({ success: false, message: 'Already punched in today.', data: record });
    }

    if (record) {
      record.checkIn = checkInTime;
      record.status = 'Present';
      record.verificationMethod = req.body.verificationMethod || 'manual';
      record.locationVerified = req.body.locationVerified || false;
      record.wifiVerified = req.body.wifiVerified || false;
      record.isWFH = Boolean(req.body.isWFH);
      record.shiftType = req.body.shiftType || 'Day Shift';
    } else {
      record = new Attendance({
        employeeId: empId,
        employeeName: empName,
        department: dept,
        date: today,
        dateRaw: todayRaw,
        checkIn: checkInTime,
        checkOut: '--:--',
        status: 'Present',
        verificationMethod: req.body.verificationMethod || 'manual',
        locationVerified: req.body.locationVerified || false,
        wifiVerified: req.body.wifiVerified || false,
        isWFH: Boolean(req.body.isWFH),
        shiftType: req.body.shiftType || 'Day Shift',
      });
    }

    await record.save();

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('attendance:checkin', { employeeId: empId, employeeName: empName, time: checkInTime, date: today });
    }

    res.json({
      success: true,
      message: `Punched in successfully at ${checkInTime} and saved to database!`,
      data: record,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Punch out (check-out) - Saves worked hours to MongoDB database
 * @route   POST /api/attendance/check-out
 */
export const checkOut = async (req, res) => {
  try {
    const today = getTodayFormatted();
    const todayRaw = getTodayRaw();
    const empId = req.body.employeeId || req.user?.employeeId || req.user?.id || 'EMP001';
    const checkOutTime = req.body.checkOutTime || getCurrentTimeFormatted();

    const record = await Attendance.findOne({
      $or: [
        { employeeId: empId, date: today },
        { employeeId: empId, dateRaw: todayRaw },
      ],
    });

    if (!record || !record.checkIn || record.checkIn === '--:--') {
      return res.status(400).json({ success: false, message: 'Not checked in today. Please punch in first.' });
    }

    if (record.checkOut && record.checkOut !== '--:--') {
      return res.status(400).json({ success: false, message: 'Already punched out today.', data: record });
    }

    record.checkOut = checkOutTime;

    // Calculate worked hours, pending hours & overtime
    const calc = calculateAttendanceHours(record.checkIn, checkOutTime);
    record.workedHours = calc.workedHours;
    record.pendingHours = calc.pendingHours;
    record.overtime = calc.overtime;
    record.totalMinutes = calc.totalMinutes;

    await record.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('attendance:checkout', { employeeId: empId, time: checkOutTime, date: today, workedHours: calc.workedHours });
    }

    res.json({
      success: true,
      message: `Punched out successfully at ${checkOutTime}! Total worked: ${calc.workedHours}`,
      data: record,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    HR manual correction / override
 * @route   PUT /api/attendance/:id
 */
export const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      record[key] = updates[key];
    });

    // Recalculate if times changed
    if (updates.checkIn || updates.checkOut) {
      const calc = calculateAttendanceHours(record.checkIn, record.checkOut);
      record.workedHours = calc.workedHours;
      record.pendingHours = calc.pendingHours;
      record.overtime = calc.overtime;
      record.totalMinutes = calc.totalMinutes;
    }

    await record.save();
    res.json({ success: true, message: 'Attendance record updated.', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
