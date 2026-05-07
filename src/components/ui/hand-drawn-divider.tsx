import clsx from "clsx";

type Variant = "wave" | "sparkle" | "leaf" | "dots";

interface HandDrawnDividerProps {
  variant?: Variant;
  className?: string;
  width?: number;
}

const PATHS: Record<Variant, React.ReactNode> = {
  wave: (
    <path
      d="M2 12 Q 24 4 48 12 T 94 12 T 140 12 T 186 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  sparkle: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M94 4 V20" />
      <path d="M86 12 H102" />
      <path d="M70 12 L78 8 L82 12 L78 16 Z" />
      <path d="M118 12 L114 8 L110 12 L114 16 Z" />
      <circle cx="40" cy="12" r="1.6" fill="currentColor" />
      <circle cx="148" cy="12" r="1.6" fill="currentColor" />
    </g>
  ),
  leaf: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12 H78" />
      <path d="M82 12 C 86 4 96 4 100 12 C 96 20 86 20 82 12 Z" />
      <path d="M88 12 L94 12" />
      <path d="M104 12 H172" />
      <path d="M178 12 L184 8" />
      <path d="M178 12 L184 16" />
    </g>
  ),
  dots: (
    <g fill="currentColor">
      <circle cx="40" cy="12" r="2" />
      <circle cx="64" cy="12" r="1.4" />
      <circle cx="84" cy="12" r="1" />
      <circle cx="104" cy="12" r="1.4" />
      <circle cx="124" cy="12" r="2" />
      <circle cx="148" cy="12" r="1.4" />
    </g>
  ),
};

export function HandDrawnDivider({
  variant = "wave",
  className,
  width = 188,
}: HandDrawnDividerProps) {
  return (
    <svg
      className={clsx("text-accent-dark", className)}
      viewBox="0 0 188 24"
      width={width}
      height={(24 / 188) * width}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[variant]}
    </svg>
  );
}
