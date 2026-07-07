'use client';
import { useState, useRef } from 'react';

export default function Button({ children, className = '', onClick, disabled, ...props }) {
  const ref = useRef(null);
  const [ripples, setRipples] = useState([]);

  function handleClick(e) {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute pointer-events-none rounded-full bg-white/25 animate-ripple"
          style={{
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
    </button>
  );
}
