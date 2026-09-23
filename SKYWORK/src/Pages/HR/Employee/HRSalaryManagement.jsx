import React from "react";
import HRSalaryManagementPage from "../Salary/HRSalaryManagementPage";

export default function HRSalaryManagement(props) {
  return <HRSalaryManagementPage userRole="hr" {...props} />;
}
