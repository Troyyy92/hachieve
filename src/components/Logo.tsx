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
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(className)}
    >
      {/* Path for the octagonal shape with a transparent square inside */}
      <path 
        d="M 50 5 L 15 15 L 5 50 L 15 85 L 50 95 L 85 85 L 95 50 L 85 15 Z M 35 35 L 65 35 L 65 65 L 35 65 Z" 
        fill="currentColor" 
        fillRule="evenodd"
      />
    </svg>
  );
};