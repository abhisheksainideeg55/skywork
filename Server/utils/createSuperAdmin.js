import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Holiday from '../models/Holiday.js';

export const ensureInitialHolidays = async () => {
  try {
    const seedHolidays = [
      {
        holidayId: 'HOL-2026-001',
        name: "New Year's Day",
        date: '2026-01-01',
        day: 'Thursday',
        type: 'Company Holiday',
        duration: 'Full Day',
        description: 'Beginning of the New Year 2026 celebration.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-002',
        name: 'Makar Sankranti / Pongal',
        date: '2026-01-14',
        day: 'Wednesday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Harvest festival celebrated across India.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-003',
        name: 'Republic Day',
        date: '2026-01-26',
        day: 'Monday',
        type: 'National Holiday',
        duration: 'Full Day',
        description: 'Honoring the Constitution of India.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-004',
        name: 'Maha Shivratri',
        date: '2026-02-16',
        day: 'Monday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Annual festival dedicated to Lord Shiva.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-005',
        name: 'Holi (Festival of Colors)',
        date: '2026-03-04',
        day: 'Wednesday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Festival of colors celebrating arrival of spring.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-006',
        name: 'Eid-ul-Fitr',
        date: '2026-03-21',
        day: 'Saturday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Religious festival marking the end of Ramadan.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-007',
        name: 'Good Friday',
        date: '2026-04-03',
        day: 'Friday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Christian holiday commemorating the crucifixion of Jesus.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-008',
        name: 'Dr. B.R. Ambedkar Jayanti',
        date: '2026-04-14',
        day: 'Tuesday',
        type: 'National Holiday',
        duration: 'Full Day',
        description: 'Birth anniversary of the principal architect of the Indian Constitution.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-009',
        name: 'International Labor Day / May Day',
        date: '2026-05-01',
        day: 'Friday',
        type: 'Company Holiday',
        duration: 'Full Day',
        description: 'Celebrating laborers and the working classes worldwide.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-010',
        name: 'Independence Day',
        date: '2026-08-15',
        day: 'Saturday',
        type: 'National Holiday',
        duration: 'Full Day',
        description: "Commemorating the nation's independence with flag-hoisting.",
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-011',
        name: 'Skywork Foundation Day',
        date: '2026-09-15',
        day: 'Tuesday',
        type: 'Company Holiday',
        duration: 'Full Day',
        description: 'Annual Skywork company foundation anniversary.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-012',
        name: 'Mahatma Gandhi Jayanti',
        date: '2026-10-02',
        day: 'Friday',
        type: 'National Holiday',
        duration: 'Full Day',
        description: 'Celebrating the birth anniversary of Mahatma Gandhi.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-013',
        name: 'Diwali (Deepavali)',
        date: '2026-11-08',
        day: 'Sunday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Festival of Lights celebrating victory of light over darkness.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
      {
        holidayId: 'HOL-2026-014',
        name: 'Christmas Day',
        date: '2026-12-25',
        day: 'Friday',
        type: 'Festival Holiday',
        duration: 'Full Day',
        description: 'Annual festival commemorating the birth of Jesus Christ.',
        status: 'Active',
        year: 2026,
        createdBy: 'EMP-HR01',
        createdByName: 'Abhishek Sharma (HR)',
      },
    ];

    for (const h of seedHolidays) {
      await Holiday.updateOne(
        { $or: [{ holidayId: h.holidayId }, { date: h.date }] },
        { $setOnInsert: h },
        { upsert: true }
      );
    }
    console.log('✅ Official company holidays verified & synced in MongoDB.');
  } catch (err) {
    console.error('❌ Error seeding holidays:', err.message);
  }
};

import { BreakPolicy } from '../models/Break.js';

export const ensureInitialBreakPolicies = async () => {
  try {
    const seedPolicies = [
      {
        policyId: "BRK-POL-01",
        name: "Lunch Break (Day Shift)",
        type: "Lunch Break",
        shiftType: "Day Shift",
        startTime: "13:00",
        endTime: "14:00",
        displayTime: "01:00 PM – 02:00 PM",
        durationMinutes: 60,
        isMandatory: true,
        alarmSound: "chime",
        autoAlertEnabled: true,
        description: "Standard 1-hour midday lunch & relaxation break for all daytime staff.",
        location: "Main Cafeteria & Dining Hall",
        allowance: "Complimentary Subsidized Buffet",
        color: {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-800",
          badge: "bg-amber-100 text-amber-800",
          gradient: "from-amber-500 to-orange-500",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
      {
        policyId: "BRK-POL-02",
        name: "Morning Tea & Coffee (Day Shift)",
        type: "Morning Tea Break",
        shiftType: "Day Shift",
        startTime: "11:15",
        endTime: "11:30",
        displayTime: "11:15 AM – 11:30 AM",
        durationMinutes: 15,
        isMandatory: false,
        alarmSound: "bell",
        autoAlertEnabled: true,
        description: "Short refreshment pause with coffee, green tea, and healthy snacks.",
        location: "Floor Pantries & Beverage Hubs",
        allowance: "Free Espresso & Beverage Station",
        color: {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-800",
          badge: "bg-emerald-100 text-emerald-800",
          gradient: "from-emerald-500 to-teal-600",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
      {
        policyId: "BRK-POL-03",
        name: "Evening Tea & Snacks (Day Shift)",
        type: "Evening Tea Break",
        shiftType: "Day Shift",
        startTime: "16:45",
        endTime: "17:00",
        displayTime: "04:45 PM – 05:00 PM",
        durationMinutes: 15,
        isMandatory: false,
        alarmSound: "chime",
        autoAlertEnabled: true,
        description: "Evening break for chai, juice, and relaxation before wrap-up.",
        location: "Floor Pantries & Lounge",
        allowance: "Snacks & Refreshment Counters",
        color: {
          bg: "bg-sky-50",
          border: "border-sky-200",
          text: "text-sky-800",
          badge: "bg-sky-100 text-sky-800",
          gradient: "from-sky-500 to-blue-600",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
      {
        policyId: "BRK-POL-04",
        name: "Dinner Break (Night Shift)",
        type: "Dinner Break",
        shiftType: "Night Shift",
        startTime: "01:00",
        endTime: "02:00",
        displayTime: "01:00 AM – 02:00 AM",
        durationMinutes: 60,
        isMandatory: true,
        alarmSound: "digital",
        autoAlertEnabled: true,
        description: "Main night shift hot dinner buffet break with power nap lounge access.",
        location: "Night Owl Lounge & 24/7 Dining Hall",
        allowance: "Special Night Catered Meal Stipend",
        color: {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-800",
          badge: "bg-purple-100 text-purple-800",
          gradient: "from-purple-600 to-indigo-700",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
      {
        policyId: "BRK-POL-05",
        name: "Midnight Refreshment (Night Shift)",
        type: "Midnight Refreshment",
        shiftType: "Night Shift",
        startTime: "04:00",
        endTime: "04:15",
        displayTime: "04:00 AM – 04:15 AM",
        durationMinutes: 15,
        isMandatory: false,
        alarmSound: "chime",
        autoAlertEnabled: true,
        description: "Energy booster coffee & snack pause to maintain focus during early morning hours.",
        location: "24/7 Beverage Hub",
        allowance: "Energy Drinks & Fresh Fruit",
        color: {
          bg: "bg-fuchsia-50",
          border: "border-fuchsia-200",
          text: "text-fuchsia-800",
          badge: "bg-fuchsia-100 text-fuchsia-800",
          gradient: "from-fuchsia-600 to-pink-600",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
      {
        policyId: "BRK-POL-06",
        name: "Rotational Evening Break",
        type: "Rotational Evening Break",
        shiftType: "Rotational Shift",
        startTime: "18:00",
        endTime: "19:00",
        displayTime: "06:00 PM – 07:00 PM",
        durationMinutes: 60,
        isMandatory: true,
        alarmSound: "bell",
        autoAlertEnabled: true,
        description: "Primary evening dinner & reset break for bi-weekly rotational staff.",
        location: "Main Cafeteria",
        allowance: "Standard Evening Buffet",
        color: {
          bg: "bg-teal-50",
          border: "border-teal-200",
          text: "text-teal-800",
          badge: "bg-teal-100 text-teal-800",
          gradient: "from-teal-500 to-emerald-600",
        },
        createdBy: "EMP-HR01",
        createdByName: "Abhishek Sharma (HR)",
        isActive: true,
      },
    ];

    for (const p of seedPolicies) {
      await BreakPolicy.updateOne(
        { policyId: p.policyId },
        { $setOnInsert: p },
        { upsert: true }
      );
    }
    console.log('✅ Official break policies verified & synced in MongoDB.');
  } catch (err) {
    console.error('❌ Error seeding break policies:', err.message);
  }
};

export const ensureSuperAdmin = async () => {
  try {
    // If the old legacy 'employees' collection exists in MongoDB, drop it to prevent duplication
    try {
      if (mongoose.connection && mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasEmployeesCol = collections.some((c) => c.name === 'employees');
        if (hasEmployeesCol) {
          console.log('🧹 Cleaning up redundant legacy "employees" collection from MongoDB...');
          await mongoose.connection.db.dropCollection('employees');
          console.log('✅ Redundant collection dropped. Now only "users" collection is active.');
        }
      }
    } catch (dropErr) {
      // Non-fatal if already clean
    }

    // Check if superadmin already exists
    let superAdmin = await User.findOne({ role: 'superadmin' });

    const defaultPassword = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    if (!superAdmin) {
      console.log('⚡ No Super Admin found in MongoDB. Creating default Super Admin...');

      superAdmin = await User.create({
        employeeId: 'SA001',
        email: 'superadmin@skywork.io',
        name: 'Super Administrator',
        employeeName: 'Super Administrator',
        role: 'superadmin',
        department: 'Executive Administration',
        designation: 'Super Administrator',
        phone: '+91 98765 00001',
        passwordHash,
        salt,
        isActive: true,
        status: 'Active',
        idCardIssued: true,
        accessLevel: 'Full Access (Super Admin)',
        mustChangePassword: false,
        permissions: ['*'],
        delegatablePermissions: [],
        joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });

      console.log('✅ Super Admin created successfully in MongoDB: superadmin@skywork.io / Password@123');
    } else {
      console.log(`✅ Super Admin active in MongoDB: ${superAdmin.email} (${superAdmin.employeeId})`);
    }

    // Ensure HR Admin exists in MongoDB
    let hrAdmin = await User.findOne({ $or: [{ email: 'hr@skywork.io' }, { employeeId: 'HR001' }] });
    if (!hrAdmin) {
      console.log('⚡ Creating default HR Admin in MongoDB...');
      hrAdmin = await User.create({
        employeeId: 'HR001',
        email: 'hr@skywork.io',
        name: 'Payal Sharma',
        employeeName: 'Payal Sharma',
        role: 'hr',
        department: 'Human Resources',
        designation: 'HR Lead & People Operations',
        phone: '+91 98765 00002',
        passwordHash,
        salt,
        isActive: true,
        status: 'Active',
        idCardIssued: true,
        accessLevel: 'HR Admin Access',
        mustChangePassword: false,
        permissions: [
          'user:read', 'user:write', 'user:delete',
          'leave:read', 'leave:approve', 'leave:reject',
          'attendance:read', 'attendance:write',
          'payroll:read', 'payroll:write',
          'wfh:read', 'wfh:approve', 'wfh:reject',
          'shift:read', 'shift:write',
          'break:read', 'break:write',
          'holiday:read', 'holiday:write',
          'report:read', 'report:write',
        ],
        delegatablePermissions: [
          'leave:read', 'leave:approve', 'leave:reject',
          'wfh:read', 'wfh:approve', 'wfh:reject',
          'attendance:read', 'shift:read',
        ],
        joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
      console.log('✅ HR Admin created in MongoDB: hr@skywork.io (HR001) / Password@123');
    }

    // Ensure default Employee exists in MongoDB
    let employeeUser = await User.findOne({ $or: [{ email: 'employee@skywork.io' }, { employeeId: 'EMP001' }] });
    if (!employeeUser) {
      console.log('⚡ Creating default Employee in MongoDB...');
      employeeUser = await User.create({
        employeeId: 'EMP001',
        email: 'employee@skywork.io',
        name: 'Abhishek Sharma',
        employeeName: 'Abhishek Sharma',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Developer',
        phone: '+91 98765 00003',
        passwordHash,
        salt,
        isActive: true,
        status: 'Active',
        idCardIssued: true,
        accessLevel: 'Standard Employee Access',
        mustChangePassword: false,
        permissions: [
          'leave:read', 'leave:apply',
          'wfh:read', 'wfh:apply',
          'attendance:read', 'attendance:clock',
          'shift:read', 'break:read', 'break:clock',
          'holiday:read', 'payslip:read',
        ],
        delegatablePermissions: [],
        joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
      console.log('✅ Employee created in MongoDB: employee@skywork.io (EMP001) / Password@123');
    }

    // Update passwords of any custom created users to Password@123 if they need reset
    await User.updateMany(
      { $or: [{ email: 'payal@skywork.io' }, { email: 'abhisheksaini@skywork.io' }] },
      { $set: { passwordHash, salt, isActive: true } }
    );

    await ensureInitialHolidays();
    await ensureInitialBreakPolicies();

    return superAdmin;
  } catch (error) {
    console.error('❌ Error in ensureSuperAdmin:', error.message);
  }
};

// Standalone script execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const run = async () => {
    try {
      const uri = process.env.MONGODB_URI;
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('Connected.');
      await ensureSuperAdmin();
      await mongoose.disconnect();
      console.log('Done.');
      process.exit(0);
    } catch (e) {
      console.error('Fatal error:', e);
      process.exit(1);
    }
  };
  run();
}
