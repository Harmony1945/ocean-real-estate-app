"use client";

import type { ReactNode } from "react";

type PropertyImageFrameProps = {
  alt: string;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  src: string;
  variant?: "card" | "hero" | "print";
  onError?: () => void;
};

const watermarkClassByVariant = {
  card: "bottom-8 w-[30%] min-w-16 max-w-28 opacity-80",
  hero: "bottom-12 w-[30%] min-w-32 max-w-md opacity-80",
  print: "bottom-9 w-[26%] min-w-28 max-w-72 opacity-[0.78]"
};

export function PropertyImageFrame({
  alt,
  children,
  className = "",
  imageClassName = "",
  priority = false,
  src,
  variant = "card",
  onError
}: PropertyImageFrameProps) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-white/[0.06] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`relative z-0 h-full w-full object-cover ${imageClassName}`}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        onError={onError}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-t from-black/68 via-black/28 to-transparent" />
      <img
        src="/assets/brand/ocean-watermark.png"
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 z-20 h-auto -translate-x-1/2 select-none ${watermarkClassByVariant[variant]}`}
        draggable={false}
      />
      {children ? <div className="absolute inset-0 z-30">{children}</div> : null}
    </div>
  );
}
