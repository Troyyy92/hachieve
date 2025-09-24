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
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(className)}
    >
      <path d="M50 0L61.2257 34.5491H97.5528L68.1636 55.4509L79.3893 90.L50 69.0983L20.6107 90L31.8364 55.4509L2.44717 34.5491H38.7743L50 0Z" fill="#4A5FE8"/>
    </svg>
  );
};