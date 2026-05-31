"use client";

import { useState } from "react";
import { OCEAN_BRAND_ASSETS } from "@/lib/oos/brand-assets";

type BrandLogoProps = {
  variant: "ocean-only" | "full";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
};

const logoSizeClasses = {
  "ocean-only": {
    sm: "w-32 sm:w-40",
    md: "w-40 sm:w-52 lg:w-56",
    lg: "w-48 sm:w-64 lg:w-72",
    xl: "w-56 sm:w-72 lg:w-80"
  },
  full: {
    sm: "w-32 sm:w-40 lg:w-44",
    md: "w-40 sm:w-48 lg:w-52",
    lg: "w-44 sm:w-56",
    xl: "w-52 sm:w-64"
  }
} as const;

export default function BrandLogo({
  variant,
  size = "md",
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
      className={`${logoSizeClasses[variant][size]} h-auto object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
