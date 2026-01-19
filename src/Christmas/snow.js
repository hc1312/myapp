import React, { useMemo } from 'react';
import './snow.css'
export default function Snow() {
  const flakes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
      opacity: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="snow-container">
      {flakes.map(flake => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
          }}
        />
      ))}
    </div>
  );
}
