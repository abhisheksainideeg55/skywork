import Salary from '../models/Salary.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all salaries / payroll records
 * @route   GET /api/salaries
 */
export const getSalaries = async (req, res) => {
  try {
    const { employeeId, month, year, paymentStatus, search } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (month) filter.payrollMonth = month;
    if (year) filter.payrollYear = Number(year);
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const salaries = await Salary.find(filter).sort({ createdAt: -1 });

    // Summary statistics
    const totalPayroll = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const paidCount = salaries.filter((s) => s.paymentStatus === 'Paid').length;
    const pendingCount = salaries.filter((s) => s.paymentStatus === 'Pending').length;

    res.json({
      success: true,
      data: salaries,
      meta: {
        total: salaries.length,
        totalPayroll,
        paidCount,
        pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single salary record
 * @route   GET /api/salaries/:id
 */
export const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findOne({
      $or: [
        { salaryId: req.params.id },
        { employeeId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    });

    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create salary record (or update if already exists for employee)
 * @route   POST /api/salaries
 */
export const createSalary = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Check if salary record already exists for this employee
    if (employeeId) {
      let existing = await Salary.findOne({ employeeId });
      if (existing) {
        Object.assign(existing, req.body);
        await existing.save();
        return res.json({ success: true, data: existing, message: 'Salary structure updated successfully' });
      }
    }

    const count = await Salary.countDocuments();
    const salaryId = `SAL-${String(count + 1).padStart(4, '0')}`;

    const salary = new Salary({
      ...req.body,
      salaryId: req.body.salaryId || salaryId,
    });

    await salary.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'SALARY_CREATED',
      resource: 'Salary',
      resourceId: salary.salaryId,
      details: { employeeId: salary.employeeId, netSalary: salary.netSalary },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: salary, message: 'Salary record created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update salary record
 * @route   PUT /api/salaries/:id
 */
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findOne({
      $or: [
        { salaryId: req.params.id },
        { employeeId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    });

    if (!salary) {
      // If not found, create new one
      const count = await Salary.countDocuments();
      const salaryId = `SAL-${String(count + 1).padStart(4, '0')}`;
      const newSalary = new Salary({
        ...req.body,
        salaryId: req.body.salaryId || salaryId,
        employeeId: req.body.employeeId || req.params.id,
      });
      await newSalary.save();
      return res.status(201).json({ success: true, data: newSalary, message: 'Salary record created successfully' });
    }

    Object.assign(salary, req.body);
    await salary.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: 'SALARY_UPDATED',
      resource: 'Salary',
      resourceId: salary.salaryId,
      details: req.body,
      status: 'SUCCESS',
    });

    res.json({ success: true, data: salary, message: 'Salary record updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Process bulk payout / update status
 * @route   POST /api/salaries/process-payout
 */
export const processPayout = async (req, res) => {
  try {
    const { salaryIds, paymentStatus = 'Paid', disbursementDate } = req.body;

    if (!Array.isArray(salaryIds) || salaryIds.length === 0) {
      return res.status(400).json({ success: false, message: 'salaryIds array is required' });
    }

    const todayDate = disbursementDate || new Date().toISOString().split('T')[0];

    await Salary.updateMany(
      { salaryId: { $in: salaryIds } },
      {
        $set: {
          paymentStatus,
          disbursementDate: todayDate,
          payslipGenerated: true,
        },
      }
    );

    const updated = await Salary.find({ salaryId: { $in: salaryIds } });

    // Send notifications to affected employees
    for (const sal of updated) {
      await Notification.create({
        notificationId: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: sal.employeeId,
        title: 'Salary Disbursed',
        message: `Your salary of ₹${sal.netSalary?.toLocaleString()} for ${sal.payrollMonth} has been credited.`,
        type: 'payroll',
        metadata: { salaryId: sal.salaryId, amount: sal.netSalary },
      });
    }

    res.json({
      success: true,
      message: `${salaryIds.length} salary records updated to ${paymentStatus}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
