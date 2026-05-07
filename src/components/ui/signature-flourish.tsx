import clsx from "clsx";

interface SignatureFlourishProps {
  className?: string;
}

export function SignatureFlourish({ className }: SignatureFlourishProps) {
  return (
    <svg
      className={clsx("text-accent-dark", className)}
      viewBox="0 0 200 60"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 38 C 14 24, 26 18, 30 28 C 32 36, 24 42, 22 38 C 26 38, 32 32, 36 26" />
        <path d="M40 30 C 44 22, 52 22, 52 30 C 52 38, 44 38, 42 32 C 46 32, 52 30, 58 22" />
        <path d="M56 38 C 56 28, 64 24, 64 32 C 64 38, 58 40, 58 36" />
        <path d="M64 30 C 70 22, 78 22, 78 30 C 78 38, 70 38, 68 32 C 72 32, 80 28, 86 22" />
        <path d="M84 38 C 88 30, 96 28, 96 36 C 96 42, 90 42, 88 38" />
        <path d="M104 18 C 100 28, 102 38, 110 38 C 118 38, 122 26, 116 22 C 110 18, 104 26, 108 32" />
        <path d="M122 38 L 122 22 L 134 38 L 134 22" />
        <path d="M138 30 C 142 22, 150 22, 150 30 C 150 38, 142 38, 140 32 C 144 32, 152 28, 158 22" />
        <path d="M156 38 C 156 28, 164 24, 164 32 C 164 38, 158 40, 158 36" />
        <path d="M164 30 C 170 22, 178 22, 178 30 C 178 38, 170 38, 168 32 C 172 32, 180 28, 186 22 C 180 30, 174 42, 164 50" />
        <path d="M30 50 Q 90 48, 178 50" opacity="0.6" />
      </g>
    </svg>
  );
}
