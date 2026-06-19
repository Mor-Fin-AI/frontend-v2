"use client";

import { useLocation, useOutlet } from "react-router-dom";

export default function PageOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div key={location.key} data-route={location.pathname}>
      {outlet}
    </div>
  );
}
