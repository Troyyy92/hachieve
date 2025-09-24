import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number; // Size in pixels for width and height
}

export const Logo = ({ className, size = 40 }: LogoProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 450 450" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(className)}
    >
      {/* Octogone extérieur en contour */}
      <path d="M 160 60
               L 290 60
               Q 300 60 307 67
               L 383 143
               Q 390 150 390 160
               L 390 290
               Q 390 300 383 307
               L 307 383
               Q 300 390 290 390
               L 160 390
               Q 150 390 143 383
               L 67 307
               Q 60 300 60 290
               L 60 160
               Q 60 150 67 143
               L 143 67
               Q 150 60 160 60
               Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="30" /> {/* strokeWidth ajusté pour une épaisseur visible */}
      
      {/* Carré central rempli */}
      <rect x="165" y="165" 
            width="120" 
            height="120" 
            rx="15"
            ry="15"
            fill="currentColor"/>
    </svg>
  );
};