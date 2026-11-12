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
        <div className="mile-loader-symbol-stage">
          <span className="mile-loader-orbit mile-loader-orbit-one" />
          <span className="mile-loader-orbit mile-loader-orbit-two" />
          <img className="mile-loader-mark" src="/mile-icon.svg" alt="" />
          <span className="mile-loader-dot" />
        </div>
        <img className="mile-loader-wordmark" src="/mile-logo.svg" alt="MILE" />
        <p className="mile-loader-message">A little further, together.</p>
        <div className="mile-loader-track" aria-hidden="true"><span /></div>
        <span className="mile-loader-caption">EVERY STEP HAS A PURPOSE</span>
      </div>
    </div>
  );
}
