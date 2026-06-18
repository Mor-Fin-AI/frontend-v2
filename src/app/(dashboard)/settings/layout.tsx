"use client";

import { Outlet } from "react-router-dom";
import SettingsSubNav from "./components/SettingsSubNav";

export default function SettingsLayout() {
  return (
    <div className="mt-6 flex flex-col">
      <SettingsSubNav />
      <Outlet />
    </div>
  );
}
