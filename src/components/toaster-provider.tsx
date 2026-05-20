"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <div aria-live="polite" aria-atomic="true">
      <Toaster richColors position="top-right" />
    </div>
  );
}
