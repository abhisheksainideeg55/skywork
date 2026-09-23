# 🚀 Skywork HRMS Backend API Server

Enterprise-grade Node.js / Express / MongoDB backend architecture designed for the Skywork HRMS platform.

---

## 📁 Architecture Overview

```text
Server/
├── config/
│   ├── db.js                     # MongoDB connection with auto-retry
│   └── jwt.js                    # JWT access & refresh token helpers
├── controllers/
│   ├── announcementController.js # Broadcast notices & pin system
│   ├── attendanceController.js   # Punch-in/out, hours engine & overrides
│   ├── auditController.js        # Enterprise audit trails & security logs
│   ├── authController.js         # JWT auth, profile, password reset
│   ├── breakController.js        # Live break tracking & duration monitoring
│   ├── documentController.js     # KYC & employee documents upload/verify
│   ├── employeeController.js     # Directory, profile management, ID cards
│   ├── fineController.js         # Disciplinary fines & waivers
│   ├── holidayController.js      # Company calendar & holiday management
│   ├── leaveController.js        # Leave applications, balances & approvals
│   ├── notificationController.js # Real-time alerts & unread badges
│   ├── reportController.js       # Payroll, attendance & compliance reports
│   ├── salaryController.js       # Payroll calculation, payslips & payouts
│   ├── settingController.js      # System settings & business configurations
│   ├── shiftController.js        # Shift roster & weekly scheduling
│   ├── smartAttendanceController.js # Geofence GPS & Office Wi-Fi security
│   ├── userController.js         # RBAC user roles & permission matrix
│   └── wfhController.js          # Remote work requests & approvals
├── middleware/
│   ├── authMiddleware.js         # Bearer token verification
│   ├── errorMiddleware.js        # Centralized error handler & status codes
│   ├── rbacMiddleware.js         # Role & granular permission enforcement
│   └── uploadMiddleware.js       # Multer storage for documents & avatars
├── models/                       # 16 Mongoose Schemas with indexes
│   ├── Announcement.js
│   ├── Attendance.js
│   ├── AuditLog.js
│   ├── Break.js
│   ├── Document.js
│   ├── Employee.js
│   ├── Fine.js
│   ├── Holiday.js
│   ├── Leave.js
│   ├── Notification.js
│   ├── Report.js
│   ├── Salary.js
│   ├── Setting.js
│   ├── Shift.js
│   ├── SmartAttendanceConfig.js
│   └── User.js
├── routes/                       # 18 Express REST Routers
│   ├── announcementRoutes.js
│   ├── attendanceRoutes.js
│   ├── auditRoutes.js
│   ├── authRoutes.js
│   ├── breakRoutes.js
│   ├── documentRoutes.js
│   ├── employeeRoutes.js
│   ├── fineRoutes.js
│   ├── holidayRoutes.js
│   ├── leaveRoutes.js
│   ├── notificationRoutes.js
│   ├── reportRoutes.js
│   ├── salaryRoutes.js
│   ├── settingRoutes.js
│   ├── shiftRoutes.js
│   ├── smartAttendanceRoutes.js
│   ├── userRoutes.js
│   └── wfhRoutes.js
├── utils/
│   ├── attendanceEngine.js       # Auto hours, overtime & pending calc
│   └── seedData.js               # Comprehensive test data seeder
├── server.js                     # HTTP & Socket.io server entry point
└── package.json
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd Server
npm install
```

### 2. Configure Environment Variables
Verify `.env` in the `Server/` folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/skywork_hrms
JWT_SECRET=skywork_hrms_jwt_secret_key_2026_enterprise
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Initial Database
Seed initial users, employees, holidays, shifts, breaks, and configuration:
```bash
npm run seed
```

### 4. Start the Server
- Development (with hot-reload):
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

---

## 🔐 Default Demo Accounts (Pre-Seeded)

| Role | Email | Password | Employee ID | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SuperAdmin** | `admin@skywork.com` | `admin123` | `EMP000` | Full unrestricted access to all modules and system settings |
| **HR Admin** | `hr@skywork.com` | `hr123` | `EMP001` | Employee management, approvals, payroll, attendance, reports |
| **Employee** | `rajesh.k@skywork.com` | `employee123` | `EMP002` | Self-service attendance, leave, WFH, breaks, profile, payslips |

---

## 🌐 API Route Endpoints

| Endpoint | Methods | Description | Protected |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | Health status, uptime & version check | No |
| `/api/auth/login` | POST | Authenticate & obtain JWT | No |
| `/api/auth/me` | GET | Current logged-in user profile | Yes |
| `/api/auth/change-password` | POST | Change user password | Yes |
| `/api/users` | GET, POST | User list & creation (RBAC) | SuperAdmin / HR |
| `/api/users/:id/permissions` | PUT | Dynamic permission assignment | SuperAdmin |
| `/api/employees` | GET, POST | Employee directory & profile setup | SuperAdmin / HR |
| `/api/employees/:id/kyc` | PUT | KYC document approval status | SuperAdmin / HR |
| `/api/attendance` | GET | Attendance logs with date/month filters | Yes |
| `/api/attendance/check-in` | POST | Punch in with GPS/Wi-Fi check | Yes |
| `/api/attendance/check-out` | POST | Punch out & calculate worked hours | Yes |
| `/api/attendance/smart/config` | GET, PUT | Geofencing & Wi-Fi settings | Yes |
| `/api/leaves` | GET, POST | Leave requests & applications | Yes |
| `/api/leaves/balances/:id` | GET | Check employee leave balance quota | Yes |
| `/api/leaves/:id/status` | PATCH | Approve or reject leave request | HR / Admin |
| `/api/holidays` | GET, POST, PUT, DELETE | Holiday calendar management | Yes |
| `/api/wfh` | GET, POST, PATCH | Work-from-home requests & approvals | Yes |
| `/api/shifts/definitions` | GET, POST | Shift templates & timing configs | Yes |
| `/api/shifts/roster` | GET | Weekly / monthly shift roster | Yes |
| `/api/shifts/assign` | POST | Assign shift to employee | HR / Admin |
| `/api/breaks/policies` | GET | Company break policies | Yes |
| `/api/breaks/start` | POST | Clock in to break (Tea, Lunch, Bio) | Yes |
| `/api/breaks/end` | POST | Clock out of break & calculate duration | Yes |
| `/api/salaries` | GET, POST | Payroll records & salary slips | HR / Admin |
| `/api/salaries/process-payout` | POST | Bulk salary disbursement | HR / Admin |
| `/api/fines` | GET, POST, PUT | Imposed fines, reasons & waivers | HR / Admin |
| `/api/documents` | GET, POST, DELETE | Employee document uploads (Multer) | Yes |
| `/api/announcements` | GET, POST, PUT, DELETE | Company bulletins & notices | Yes |
| `/api/notifications` | GET, PUT, POST | Notification center & read receipts | Yes |
| `/api/reports` | GET, POST, DELETE | HR & Compliance report generator | HR / Admin |
| `/api/audit-logs` | GET | Security & action audit trails | HR / Admin |
| `/api/settings` | GET, PUT | Global system configuration settings | SuperAdmin |

---

## 🔌 Real-Time WebSocket Events (Socket.io)

- `join`: Join room for targeted updates (`socket.emit('join', employeeId)`)
- `attendance:checkin`: Broadcast when an employee checks in
- `attendance:checkout`: Broadcast when an employee checks out
- `break:start`: Broadcast when an employee begins a break
- `break:end`: Broadcast when break ends with duration & excess alerts
- `leave:status`: Direct event sent to employee room on status changes
