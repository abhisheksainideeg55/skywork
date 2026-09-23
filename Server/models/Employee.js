import User from './User.js';

// Re-export User model as Employee so both interfaces operate on the single unified 'users' collection in MongoDB
const Employee = User;
export default Employee;
