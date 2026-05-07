import clsx from "clsx";

interface PaperTextureProps {
  className?: string;
}

export function PaperTexture({ className }: PaperTextureProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "absolute inset-0 paper-texture opacity-[0.05] mix-blend-multiply",
        className,
      )}
    />
  );
}
