import React from "react";
import AppTopHeader from "../Navigation/AppTopHeader";

export default function HRTopHeader(props) {
  return <AppTopHeader role="hr" portalBadge="HR Admin" brandHome="/hr" {...props} />;
}
