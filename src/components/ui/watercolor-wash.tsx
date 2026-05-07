import clsx from "clsx";

type WashColor = "cobalt" | "terracotta" | "sunset";

interface WatercolorWashProps {
  color: WashColor;
  className?: string;
}

const COLOR_CLASS: Record<WashColor, string> = {
  cobalt: "watercolor-wash-cobalt",
  terracotta: "watercolor-wash-terracotta",
  sunset: "watercolor-wash-sunset",
};

export function WatercolorWash({ color, className }: WatercolorWashProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("absolute pointer-events-none", COLOR_CLASS[color], className)}
    />
  );
}
