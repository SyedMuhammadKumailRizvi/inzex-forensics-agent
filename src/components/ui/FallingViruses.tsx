"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Virus {
  id: number;
  x: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export function FallingViruses() {
  const [viruses, setViruses] = useState<Virus[]>([]);

  useEffect(() => {
    // Generate 15 random falling viruses
    const newViruses = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position (%)
      duration: Math.random() * 10 + 15, // Fall duration between 15-25s
      delay: Math.random() * -20, // Negative delay so they are already on screen when loaded
      size: Math.random() * 14 + 10, // Size between 10px and 24px
      opacity: Math.random() * 0.3 + 0.1, // Very subtle opacity (0.1 to 0.4)
    }));
    setViruses(newViruses);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {viruses.map((virus) => (
        <motion.div
          key={virus.id}
          className="absolute text-[#9D00FF]"
          style={{ 
            left: `${virus.x}%`,
            fontSize: `${virus.size}px`,
            opacity: virus.opacity,
          }}
          initial={{ y: "-10vh" }}
          animate={{ y: "110vh" }}
          transition={{
            duration: virus.duration,
            repeat: Infinity,
            delay: virus.delay,
            ease: "linear",
          }}
        >
          👾
        </motion.div>
      ))}
    </div>
  );
}
