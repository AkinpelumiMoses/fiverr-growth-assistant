"use client";

import { useEffect, useState } from "react";

export default function BrandLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setLeaving(true), 2850);
    const finish = window.setTimeout(() => setVisible(false), 3450);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`mile-loader mile-loader-premium${leaving ? " is-leaving" : ""}`} role="status" aria-label="Loading MILE">
      <div className="mile-loader-inner">
        <img className="mile-loader-icon" src="/mile-icon.png" alt="MILE" />
      </div>
    </div>
  );
}
