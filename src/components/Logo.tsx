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
      {/* Octogone extérieur avec coins arrondis */}
      <g>
        {/* Fond bleu de l'octogone avec coins arrondis */}
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
              fill="#2443cc"/>
        
        {/* Trou intérieur */}
        <path d="M 165 90
                 L 285 90
                 L 360 165
                 L 360 285
                 L 285 360
                 L 165 360
                 L 90 285
                 L 90 165
                 Z" 
              fill="white"/>
      </g>
      
      {/* Carré central aligné avec les segments de l'octogone */}
      <rect x="165" y="165" 
            width="120" 
            height="120" 
            rx="15"
            ry="15"
            fill="#2443cc"/>
    </svg>
  );
};