import { ShiftDefinition, ShiftAllocation } from '../models/Shift.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const DEFAULT_DEFINITIONS = [
  {
    shiftId: 'SHIFT-01',
    name: 'Day Shift',
    type: 'Day Shift',
    code: 'GEN-DAY',
    timings: '09:00 AM – 06:00 PM',
    startTime: '09:00',
    endTime: '18:00',
    duration: '9 hrs (8 hrs work + 1 hr lunch)',
    lunchBreak: '01:00 PM – 02:00 PM (60 min)',
    description: 'Standard company business hours for daytime engineering and administrative operations.',
    allowance: 'Standard Base Salary (No shift allowance)',
    transportSupport: 'Self / Optional Metro shuttle service',
    isActive: true,
  },
  {
    shiftId: 'SHIFT-02',
    name: 'Night Shift',
    type: 'Night Shift',
    code: 'NIGHT-OPS',
    timings: '09:00 PM – 06:00 AM',
    startTime: '21:00',
    endTime: '06:00',
    duration: '9 hrs (8 hrs work + 1 hr break)',
    lunchBreak: '01:30 AM – 02:30 AM (60 min)',
    description: 'Overnight operations & international client support shift with safety protocol compliance.',
    allowance: '₹350/Night Shift Allowance + Free Midnight Meal',
    transportSupport: 'Free GPS-tracked Door-to-Door Cab Service with security escort',
    isActive: true,
  },
  {
    shiftId: 'SHIFT-03',
    name: 'Rotational Shift',
    type: 'Rotational Shift',
    code: 'ROTA-ALT',
    timings: '06:00 AM – 02:30 PM / 01:30 PM – 10:00 PM',
    startTime: '06:00',
    endTime: '22:00',
    duration: '8.5 hrs alternating rotation',
    lunchBreak: '45-minute scheduled rotational break window',
    description: 'Alternates bi-weekly between early morning and afternoon/evening windows for 24/7 continuous operations.',
    allowance: '₹150/Day Rotational Allowance',
    transportSupport: 'Drop cab available for shifts concluding after 10:00 PM',
    isActive: true,
  },
];

/**
 * @desc    Get shift definitions (seeds defaults if empty)
 * @route   GET /api/shifts/definitions
 */
export const getShiftDefinitions = async (req, res) => {
  try {
    let shifts = await ShiftDefinition.find({ isActive: true }).sort({ shiftId: 1 });
    if (shifts.length === 0) {
      await ShiftDefinition.insertMany(DEFAULT_DEFINITIONS);
      shifts = await ShiftDefinition.find({ isActive: true }).sort({ shiftId: 1 });
    }
    res.json({ success: true, data: shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Create shift definition
 * @route   POST /api/shifts/definitions
 */
export const createShiftDefinition = async (req, res) => {
  try {
    const shiftId = req.body.shiftId || `SHIFT-${Date.now()}`;
    const shift = await ShiftDefinition.create({ ...req.body, shiftId });
    res.status(201).json({ success: true, message: 'Shift definition created.', data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Get shift roster / allocations
 *          Employee can ONLY view their own allocated shift.
 *          HR / Super Admin can view all or filter.
 * @route   GET /api/shifts/roster
 */
export const getShiftRoster = async (req, res) => {
  try {
    const { employeeId, department, shiftType, status } = req.query;
    const filter = {};

    const userRole = (req.user?.role || '').toLowerCase();
    const userEmpId = req.user?.employeeId || req.user?.id;

    // Strict role check: Employee can only see their own shifts
    if (userRole === 'employee' || userRole === 'user') {
      filter.employeeId = userEmpId;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (department && department !== 'All Departments') filter.department = department;
    if (shiftType && shiftType !== 'All Shifts') filter.shiftType = shiftType;
    if (status && status !== 'All Statuses') filter.status = status;

    let allocations = await ShiftAllocation.find(filter).sort({ createdAt: -1 });

    // If an employee has no allocation yet in DB, check their User document for default shift
    if (allocations.length === 0 && (userRole === 'employee' || userRole === 'user')) {
      const user = await User.findOne({ $or: [{ employeeId: userEmpId }, { _id: req.user?._id }] });
      if (user) {
        const defaultShiftType = user.shift || 'Day Shift';
        const defaultDef = DEFAULT_DEFINITIONS.find((d) => d.type === defaultShiftType) || DEFAULT_DEFINITIONS[0];
        const initialAlloc = await ShiftAllocation.create({
          allocationId: `SA-${Date.now()}`,
          employeeId: user.employeeId || userEmpId,
          employeeName: user.name || user.employeeName || 'Employee',
          department: user.department || 'Engineering',
          shiftId: defaultDef.shiftId,
          shiftName: defaultDef.name,
          shiftType: defaultDef.type,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'Active',
          assignedBy: 'HR Admin',
          remarks: 'Standard allocated shift',
        });
        allocations = [initialAlloc];
      }
    }

    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * @desc    Assign / Allot shift to employee (HR / Super Admin only)
 * @route   POST /api/shifts/assign
 */
export const assignShift = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      shiftId,
      shiftName,
      shiftType,
      startDate,
      effectiveFrom,
      endDate,
      effectiveTo,
      rotationCycle,
      remarks,
      notes,
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }

    // Lookup user in DB to sync details
    const user = await User.findOne({
      $or: [{ employeeId: employeeId }, { id: employeeId }],
    });

    const empName = employeeName || user?.name || user?.employeeName || employeeId;
    const dept = department || user?.department || 'General';
    const finalShiftType = shiftType || shiftName || 'Day Shift';
    const finalStartDate = startDate || effectiveFrom || new Date().toISOString().split('T')[0];
    const finalEndDate = endDate || effectiveTo || '2026-12-31';

    const allocationId = req.body.allocationId || `SA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Upsert or update existing shift allocation in MongoDB
    const allocation = await ShiftAllocation.findOneAndUpdate(
      { employeeId },
      {
        allocationId,
        employeeId,
        employeeName: empName,
        department: dept,
        shiftId: shiftId || (finalShiftType === 'Night Shift' ? 'SHIFT-02' : finalShiftType === 'Rotational Shift' ? 'SHIFT-03' : 'SHIFT-01'),
        shiftName: finalShiftType,
        shiftType: finalShiftType,
        startDate: finalStartDate,
        endDate: finalEndDate,
        status: 'Active',
        assignedBy: req.user?.name || req.user?.employeeName || 'HR Admin',
        remarks: remarks || notes || `${finalShiftType} assigned to employee.`,
      },
      { new: true, upsert: true }
    );

    // Sync User model's shift field in database
    if (user) {
      user.shift = finalShiftType;
      await user.save();
    } else {
      await User.findOneAndUpdate(
        { employeeId },
        { shift: finalShiftType }
      );
    }

    // Audit log
    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'SHIFT_ASSIGNED',
      targetId: employeeId,
      targetType: 'shift',
      description: `${finalShiftType} allotted to ${empName} (${employeeId}) by ${req.user?.name || 'HR Admin'}.`,
      module: 'shifts',
    });

    res.status(201).json({
      success: true,
      message: `Shift successfully allotted to ${empName}.`,
      data: allocation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * @desc    Bulk Assign shifts to multiple employees (HR / Super Admin only)
 * @route   POST /api/shifts/bulk-assign
 */
export const bulkAssignShifts = async (req, res) => {
  try {
    const {
      employeeIds,
      shiftType,
      shiftName,
      shiftId,
      startDate,
      effectiveFrom,
      endDate,
      effectiveTo,
      remarks,
      notes,
    } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'employeeIds array is required.' });
    }

    const finalShiftType = shiftType || shiftName || 'Day Shift';
    const finalStartDate = startDate || effectiveFrom || new Date().toISOString().split('T')[0];
    const finalEndDate = endDate || effectiveTo || '2026-12-31';
    const assignedBy = req.user?.name || req.user?.employeeName || 'HR Admin';

    const results = [];

    for (const empId of employeeIds) {
      const user = await User.findOne({
        $or: [{ employeeId: empId }, { id: empId }],
      });

      const empName = user?.name || user?.employeeName || empId;
      const dept = user?.department || 'General';

      const allocation = await ShiftAllocation.findOneAndUpdate(
        { employeeId: empId },
        {
          allocationId: `SA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          employeeId: empId,
          employeeName: empName,
          department: dept,
          shiftId: shiftId || (finalShiftType === 'Night Shift' ? 'SHIFT-02' : finalShiftType === 'Rotational Shift' ? 'SHIFT-03' : 'SHIFT-01'),
          shiftName: finalShiftType,
          shiftType: finalShiftType,
          startDate: finalStartDate,
          endDate: finalEndDate,
          status: 'Active',
          assignedBy,
          remarks: remarks || notes || 'Bulk shift allocation',
        },
        { new: true, upsert: true }
      );

      if (user) {
        user.shift = finalShiftType;
        await user.save();
      } else {
        await User.findOneAndUpdate({ employeeId: empId }, { shift: finalShiftType });
      }

      results.push(allocation);
    }

    // Audit log
    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'SHIFT_BULK_ASSIGNED',
      targetId: 'BULK',
      targetType: 'shift',
      description: `${finalShiftType} bulk-allotted to ${results.length} employees by ${assignedBy}.`,
      module: 'shifts',
    });

    res.status(200).json({
      success: true,
      message: `Shift successfully allotted to ${results.length} employees.`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * @desc    Update shift allocation (HR / Super Admin only)
 * @route   PUT /api/shifts/allocations/:id
 */
export const updateShiftAllocation = async (req, res) => {
  try {
    const allocation = await ShiftAllocation.findOne({
      $or: [{ _id: req.params.id }, { allocationId: req.params.id }],
    });

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Shift allocation not found.' });
    }

    if (req.body.shiftType) {
      allocation.shiftType = req.body.shiftType;
      allocation.shiftName = req.body.shiftType;
    }
    if (req.body.effectiveFrom || req.body.startDate) {
      allocation.startDate = req.body.effectiveFrom || req.body.startDate;
    }
    if (req.body.effectiveTo || req.body.endDate) {
      allocation.endDate = req.body.effectiveTo || req.body.endDate;
    }
    if (req.body.status) allocation.status = req.body.status;
    if (req.body.notes !== undefined || req.body.remarks !== undefined) {
      allocation.remarks = req.body.notes !== undefined ? req.body.notes : req.body.remarks;
    }

    await allocation.save();

    // Update user shift in User model
    if (allocation.employeeId && req.body.shiftType) {
      await User.findOneAndUpdate(
        { employeeId: allocation.employeeId },
        { shift: req.body.shiftType }
      );
    }

    res.json({ success: true, message: 'Shift allocation updated in database.', data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * @desc    Delete shift allocation (HR / Super Admin only)
 * @route   DELETE /api/shifts/allocations/:id
 */
export const deleteShiftAllocation = async (req, res) => {
  try {
    const allocation = await ShiftAllocation.findOneAndDelete({
      $or: [{ _id: req.params.id }, { allocationId: req.params.id }],
    });

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Shift allocation not found.' });
    }

    // Reset user shift in database
    if (allocation.employeeId) {
      await User.findOneAndUpdate(
        { employeeId: allocation.employeeId },
        { shift: 'Day Shift' }
      );
    }

    res.json({ success: true, message: 'Shift allocation deleted successfully from database.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};
