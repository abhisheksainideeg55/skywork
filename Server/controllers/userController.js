import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { BASE_ROLE_PERMISSIONS } from '../middleware/rbacMiddleware.js';

const findUserByIdentifier = async (id) => {
  if (!id) return null;
  const isObjectId = mongoose.isValidObjectId(id);
  const query = isObjectId
    ? { $or: [{ employeeId: id }, { email: id.toLowerCase() }, { _id: id }] }
    : { $or: [{ employeeId: id }, { email: id.toLowerCase() }] };
  return User.findOne(query);
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, search, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-passwordHash -salt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const user = await findUserByIdentifier(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Create a new user (SuperAdmin or HR)
 * @route   POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const {
      employeeId,
      email,
      password,
      name,
      employeeName,
      role,
      department,
      designation,
      phone,
      permissions,
      ...extraFields
    } = req.body;

    const resolvedName = name || employeeName;

    if (!employeeId || !email || !password || !resolvedName) {
      return res.status(400).json({ success: false, message: 'employeeId, email, password, and name are required.' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email or employee ID already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = (role || 'employee').toLowerCase();

    // HR can only create employee accounts
    if (req.user && req.user.role === 'hr' && userRole !== 'employee') {
      return res.status(403).json({ success: false, message: 'HR Admin is only allowed to create Employee accounts.' });
    }

    const user = await User.create({
      ...extraFields,
      employeeId,
      email: email.toLowerCase(),
      passwordHash,
      salt,
      name: resolvedName,
      employeeName: resolvedName,
      role: userRole,
      department: department || (userRole === 'hr' ? 'Human Resources' : 'Engineering'),
      designation: designation || (userRole === 'hr' ? 'HR Executive' : 'Staff Employee'),
      phone: phone || '',
      permissions: permissions || BASE_ROLE_PERMISSIONS[userRole] || [],
      delegatablePermissions: [],
      isActive: true,
      status: 'Active',
      idCardIssued: true,
      joiningDate: extraFields.joiningDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mustChangePassword: true,
    });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'USER_CREATED',
      targetId: employeeId,
      targetType: 'user',
      description: `User ${resolvedName} (${employeeId}) created.`,
      module: 'users',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const user = await findUserByIdentifier(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, employeeName, email, role, department, designation, phone } = req.body;
    const previousValue = { name: user.name, email: user.email, role: user.role, department: user.department };

    if (name || employeeName) {
      user.name = name || employeeName;
      user.employeeName = name || employeeName;
    }
    if (email) user.email = email.toLowerCase();
    if (role) {
      user.role = role.toLowerCase();
      user.permissions = BASE_ROLE_PERMISSIONS[user.role] || user.permissions;
    }
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (phone) user.phone = phone;

    // Apply any additional profile fields
    Object.keys(req.body).forEach((k) => {
      if (!['password', 'passwordHash', 'salt', '_id', 'employeeId'].includes(k)) {
        user[k] = req.body[k];
      }
    });

    await user.save();

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'USER_UPDATED',
      targetId: user.employeeId,
      targetType: 'user',
      previousValue,
      newValue: { name: user.name, email: user.email, role: user.role, department: user.department },
      description: `User ${user.name} updated.`,
      module: 'users',
    });

    res.json({ success: true, message: 'User updated.', data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Update user permissions
 * @route   PATCH /api/users/:id/permissions
 */
export const updatePermissions = async (req, res) => {
  try {
    const user = await findUserByIdentifier(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { permissions, delegatablePermissions } = req.body;
    if (permissions) user.permissions = permissions;
    if (delegatablePermissions) user.delegatablePermissions = delegatablePermissions;

    await user.save();

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user.employeeId,
      userRole: req.user.role,
      userName: req.user.name,
      action: 'PERMISSIONS_UPDATED',
      targetId: user.employeeId,
      targetType: 'user',
      description: `Permissions updated for ${user.name} by ${req.user.name}.`,
      module: 'users',
    });

    res.json({ success: true, message: 'Permissions updated.', data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Activate/Deactivate user
 * @route   PATCH /api/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const user = await findUserByIdentifier(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot modify Super Admin status.' });
    }

    const { isActive } = req.body;
    user.isActive = isActive;
    user.status = isActive ? 'Active' : 'Inactive';
    await user.save();

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user.employeeId,
      userRole: req.user.role,
      userName: req.user.name,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetId: user.employeeId,
      targetType: 'user',
      description: `User ${user.name} ${isActive ? 'activated' : 'deactivated'} by ${req.user.name}.`,
      module: 'users',
    });

    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.`, data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await findUserByIdentifier(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete Super Administrator account.',
      });
    }

    await User.deleteOne({ _id: user._id });

    await AuditLog.create({
      logId: `LOG-${Date.now()}`,
      userId: req.user?.employeeId || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'Admin',
      action: 'USER_DELETED',
      targetId: user.employeeId,
      targetType: 'user',
      description: `User ${user.name} (${user.employeeId}) deleted.`,
      module: 'users',
    });

    return res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

export const updateUserPermissions = updatePermissions;
export const toggleUserStatus = updateUserStatus;
