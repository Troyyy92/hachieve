import { useState, useEffect } from "react";

export function useBreakpoint(breakpoint: number) {
  const [isBelow, setIsBelow] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const onChange = () => {
      setIsBelow(mql.matches);
    };

    mql.addEventListener("change", onChange);
    // Set initial value
    setIsBelow(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!isBelow;
}