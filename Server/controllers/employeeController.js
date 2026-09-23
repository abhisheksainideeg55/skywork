import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';
import { BASE_ROLE_PERMISSIONS } from '../middleware/rbacMiddleware.js';

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 */
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (department && department !== 'All Departments') {
      filter.department = department;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 50, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const employees = await Employee.find(filter)
      .select('-passwordHash -salt')
      .sort({ employeeId: 1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const formattedEmployees = employees.map((emp) => ({
      ...emp,
      id: emp.employeeId,
      employeeName: emp.employeeName || emp.name,
      name: emp.name || emp.employeeName,
    }));

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: formattedEmployees,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get single employee
 * @route   GET /api/employees/:id
 */
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { email: req.params.id.toLowerCase() }],
    })
      .select('-passwordHash -salt')
      .lean();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.json({
      success: true,
      data: {
        ...employee,
        id: employee.employeeId,
        employeeName: employee.employeeName || employee.name,
      },
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Create / onboard new employee
 * @route   POST /api/employees
 */
export const createEmployee = async (req, res) => {
  try {
    const { employeeId, employeeName, name, email, role, password, ...extraFields } = req.body;
    const resolvedName = employeeName || name;

    if (!employeeId || !resolvedName || !email) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, employeeName, and email are required.',
      });
    }

    const normalizedEmployeeId = String(employeeId).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await Employee.findOne({
      $or: [{ employeeId: normalizedEmployeeId }, { email: normalizedEmail }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID or email already exists.',
      });
    }

    const defaultPassword = password || 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    const rawRole = (role || 'employee').toLowerCase();
    const resolvedRole = rawRole.includes('hr') ? 'hr' : rawRole.includes('admin') ? 'superadmin' : 'employee';

    // HR can only create employee accounts
    if (req.user && req.user.role === 'hr' && resolvedRole !== 'employee') {
      return res.status(403).json({ success: false, message: 'HR Admin is only allowed to create Employee accounts.' });
    }

    const employee = await Employee.create({
      ...extraFields,
      employeeId: normalizedEmployeeId,
      email: normalizedEmail,
      name: resolvedName,
      employeeName: resolvedName,
      passwordHash,
      salt,
      role: resolvedRole,
      permissions: BASE_ROLE_PERMISSIONS[resolvedRole] || [],
      department: req.body.department || (resolvedRole === 'hr' ? 'Human Resources' : 'Engineering'),
      designation: req.body.designation || (resolvedRole === 'hr' ? 'HR Executive' : 'Staff Employee'),
      status: req.body.status || 'Active',
      idCardIssued: true,
      joiningDate: req.body.joiningDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mustChangePassword: true,
      isActive: true,
    });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'EMPLOYEE_CREATED',
      targetId: normalizedEmployeeId,
      targetType: 'employee',
      description: `Employee ${resolvedName} (${normalizedEmployeeId}) onboarded.`,
      module: 'employees',
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: employee.toSafeObject(),
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * @desc    Update employee profile
 * @route   PUT /api/employees/:id
 */
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { email: req.params.id.toLowerCase() }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (req.user && req.user.role === 'employee' && req.user.employeeId !== employee.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own profile.' });
    }

    const updatedFields = { ...req.body };
    delete updatedFields.employeeId;
    delete updatedFields.passwordHash;
    delete updatedFields.salt;

    if (updatedFields.employeeName || updatedFields.name) {
      const nm = updatedFields.employeeName || updatedFields.name;
      employee.employeeName = nm;
      employee.name = nm;
    }

    Object.keys(updatedFields).forEach((key) => {
      employee[key] = updatedFields[key];
    });

    await employee.save();

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'EMPLOYEE_UPDATED',
      targetId: employee.employeeId,
      targetType: 'employee',
      description: `Employee ${employee.employeeName || employee.name} profile updated.`,
      module: 'employees',
    });

    res.json({
      success: true,
      message: 'Employee updated.',
      data: employee.toSafeObject(),
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Issue / update ID card
 * @route   POST /api/employees/:id/id-card
 */
export const issueIdCard = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { email: req.params.id.toLowerCase() }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const today = new Date().toISOString().split('T')[0];
    employee.idCardIssued = true;
    employee.idCardIssueDate = employee.idCardIssueDate || today;
    employee.idCardExpiry = req.body.idCardExpiry || '31 Dec 2028';

    if (req.body.accessLevel) employee.accessLevel = req.body.accessLevel;
    if (req.body.cardType) employee.cardType = req.body.cardType;

    await employee.save();

    res.json({
      success: true,
      message: 'ID Card issued/updated.',
      data: employee.toSafeObject(),
    });
  } catch (error) {
    console.error('Issue ID card error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 */
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { email: req.params.id.toLowerCase() }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (employee.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Administrator account.' });
    }

    await Employee.deleteOne({ _id: employee._id });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'EMPLOYEE_DELETED',
      targetId: employee.employeeId,
      targetType: 'employee',
      description: `Employee ${employee.employeeName || employee.name} (${employee.employeeId}) removed.`,
      module: 'employees',
    });

    res.json({
      success: true,
      message: 'Employee deleted successfully.',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Update employee KYC status
 * @route   PUT /api/employees/:id/kyc
 */
export const updateKYCStatus = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { email: req.params.id.toLowerCase() }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (req.body.kycStatus) {
      employee.kycStatus = req.body.kycStatus;
    }

    await employee.save();

    res.json({
      success: true,
      message: 'KYC status updated.',
      data: employee.toSafeObject(),
    });
  } catch (error) {
    console.error('Update KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};