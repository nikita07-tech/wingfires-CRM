"use client";

import { toggleVendorPreferred } from "./actions";

export default function PreferredToggle({ vendorId, isPreferred }: { vendorId: string; isPreferred: boolean }) {
  return (
    <input
      type="checkbox"
      defaultChecked={isPreferred}
      onChange={(e) => toggleVendorPreferred(vendorId, e.target.checked)}
    />
  );
}
