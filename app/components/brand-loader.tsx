"use client";

import { useEffect, useState } from "react";

export default function BrandLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setLeaving(true), 1050);
    const finish = window.setTimeout(() => setVisible(false), 1650);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`mile-loader${leaving ? " is-leaving" : ""}`} role="status" aria-label="Loading MILE">
      <div className="mile-loader-inner">
        <img className="mile-loader-mark" src="/mile-icon.svg" alt="" />
        <img className="mile-loader-wordmark" src="/mile-logo.svg" alt="MILE" />
        <div className="mile-loader-line" aria-hidden="true" />
        <span className="mile-loader-caption">Every step has a purpose</span>
      </div>
    </div>
  );
}
