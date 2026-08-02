"use client";

import { toggleProductArchived } from "../actions";

export default function ArchiveToggle({ productId, isArchived }: { productId: string; isArchived: boolean }) {
  return (
    <input
      type="checkbox"
      defaultChecked={isArchived}
      onChange={(e) => toggleProductArchived(productId, e.target.checked)}
      title="Archived products are hidden from the public catalog"
    />
  );
}
