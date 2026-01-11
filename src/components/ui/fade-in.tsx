"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    className?: string;
    fullWidth?: boolean;
}

export function FadeIn({
    children,
    delay = 0,
    direction = "up",
    className = "",
    fullWidth = false,
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });

    const getInitial = () => {
        switch (direction) {
            case "up":
                return { opacity: 0, y: 40 };
            case "down":
                return { opacity: 0, y: -40 };
            case "left":
                return { opacity: 0, x: 40 };
            case "right":
                return { opacity: 0, x: -40 };
            case "none":
                return { opacity: 0 };
            default:
                return { opacity: 0, y: 40 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={getInitial()}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : getInitial()}
            transition={{
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98],
                delay: delay,
            }}
            className={className}
            style={{ width: fullWidth ? "100%" : "auto" }}
        >
            {children}
        </motion.div>
    );
}
