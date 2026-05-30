"use client";

import { useState } from "react";
import { OCEAN_BRAND_ASSETS } from "@/lib/oos/brand-assets";

type BrandLogoProps = {
  variant: "ocean-only" | "full";
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
};

export default function BrandLogo({
  variant,
  className = "",
  fallbackClassName = "",
  fallbackText
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const isFull = variant === "full";
  const src = isFull
    ? OCEAN_BRAND_ASSETS.fullLogoWhite
    : OCEAN_BRAND_ASSETS.oceanOnlyLogoWhite;
  const alt = isFull ? "Ocean Real Estate" : "Ocean";

  if (failed) {
    return (
      <span className={fallbackClassName || className}>
        {fallbackText || (isFull ? "Ocean Real Estate" : "O")}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
