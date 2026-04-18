import React from 'react';

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <figure className={`animated-gradient-text ${className}`}>
      {showBorder && <div className="gradient-text-overlay" style={gradientStyle}></div>}
      <div className="gradient-text-content" style={gradientStyle}>{children}</div>
    </figure>
  );
}
