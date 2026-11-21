import React from 'react';

// Deterministic pseudo-random values keep the field stable across re-renders.
const rand = (seed) => {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
};

const STARS = Array.from({ length: 80 }, (_, index) => {
  const a = rand(index + 1);
  const b = rand(index + 11);
  const c = rand(index + 21);
  const d = rand(index + 31);
  return {
    left: Number((a * 100).toFixed(2)),
    top: Number((b * 100).toFixed(2)),
    size: Number((1 + c * 2.4).toFixed(2)),
    delay: Number((d * 8).toFixed(2)),
    duration: Number((2.4 + a * 4.5).toFixed(2))
  };
});

const BUBBLES = Array.from({ length: 22 }, (_, index) => {
  const a = rand(index + 101);
  const b = rand(index + 201);
  const c = rand(index + 301);
  const d = rand(index + 401);
  const e = rand(index + 501);
  return {
    left: Number((a * 100).toFixed(2)),
    size: Number((10 + b * 74).toFixed(1)),
    delay: Number((-(c * 34)).toFixed(1)),
    duration: Number((20 + d * 24).toFixed(1)),
    drift: Number(((e - 0.5) * 90).toFixed(1))
  };
});

/**
 * Ambient home-screen decor: twinkling mini-stars, floating glass bubbles and
 * soft aurora orbs. Purely visual — no pointer capture, no React state.
 */
export default function HomeAmbient() {
  return (
    <div
      aria-hidden="true"
      className="home-ambient pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Depth orbs */}
      <div className="absolute -top-24 left-[10%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute top-1/3 right-[6%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-8 left-[42%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      {STARS.map((star, index) => (
        <span
          key={`star-${index}`}
          className="home-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}

      {BUBBLES.map((bubble, index) => (
        <span
          key={`bubble-${index}`}
          className="home-bubble"
          style={{
            left: `${bubble.left}%`,
            bottom: '-90px',
            width: bubble.size,
            height: bubble.size,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            '--drift': `${bubble.drift}px`
          }}
        />
      ))}
    </div>
  );
}
