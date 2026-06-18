"use client";

import { Outlet, useLocation } from "react-router-dom";

export default function RouteOutlet() {
  const { pathname } = useLocation();

  return (
    <div key={pathname} data-route={pathname}>
      <Outlet />
    </div>
  );
}
