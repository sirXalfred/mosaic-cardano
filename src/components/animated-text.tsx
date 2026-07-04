"use client";

import React, { useEffect, useRef, useState } from "react";

type AnimatedWordsProps = {
  text: string;
  delayOffset?: number;
  className?: string;
  threshold?: number;
};

export const AnimatedWords: React.FC<AnimatedWordsProps> = ({
  text,
  delayOffset = 0,
  className="",
  threshold = 0.3,
}) => {
  const words = text.split(" ");
  const ref = useRef<HTMLSpanElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // animate once (Framer-like)
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`inline-block mr-3 transition-all duration-800 ${
            isVisible
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 translate-y-8 blur-sm"
          }`}
          style={{ transitionDelay: `${(i + delayOffset) * 100}ms` }}
        >
          {word}
        </span>
      ))}
      <br />
    </span>
  );
};